import React from "react";
import { Card, Space, Avatar, Button, Typography, Divider } from "antd";
import {
    UserOutlined,
    MessageOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const { Text } = Typography;

function MeetupAuthor({ meetup, meetupId }) {
    const router = useRouter();

    const { user } = useSelector((state) => state.user);
    const isOwner = Number(user?.memberId) === Number(meetup?.memberId);

    const handleQnaClick = () => {
        router.push(`/user/qna/questionWrite?type=MEETUP&meetupId=${meetupId}`);
    };

    // const handleProfileClick = () => {
    //     router.push(`/user/profile/${meetup.memberId}`);
    // };

    const completionRate =
        meetup.hostMeetupCount > 0
            ? Math.round(
                  (meetup.completedMeetupCount / meetup.hostMeetupCount) * 100,
              )
            : 0;
    console.log(meetup);
    return (
        <Card title="작성자" className="meetup-side-card">
            {/* 기본 프로필 */}
            <Space align="center">
                <Avatar size={56} icon={<UserOutlined />} />

                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        {meetup.nickname}
                    </Text>

                    <div>
                        <Text type="secondary">모임 개설자</Text>
                    </div>
                </div>
            </Space>

            <Divider style={{ margin: "16px 0" }} />

            {/* 호스트 통계 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                    ⭐ 매너점수 <Text strong>{meetup.trustScore}점</Text>
                </div>

                <div>
                    <CalendarOutlined /> 개설한 모임:{" "}
                    <Text strong>{meetup.hostMeetupCount}회</Text>
                </div>

                <div>
                    <CheckCircleOutlined /> 완료율:{" "}
                    <Text strong>{completionRate}%</Text>
                    <Text type="secondary">
                        {" "}
                        ({meetup.completedMeetupCount}/{meetup.hostMeetupCount})
                    </Text>
                </div>

                <div>
                    <TeamOutlined />{" "}
                    {meetup.noShowCount === 0
                        ? "노쇼 없음"
                        : `노쇼 ${meetup.noShowCount}회`}
                </div>
            </div>

            {/* 프로필 보기 */}
            {/* <Button
                block
                style={{ marginTop: 16 }}
                onClick={handleProfileClick}
            >
                호스트 프로필 보기 &gt;
            </Button> */}

            {/* 문의하기 */}
            {!isOwner && (
                <Button
                    block
                    icon={<MessageOutlined />}
                    style={{ marginTop: 8 }}
                    onClick={handleQnaClick}
                >
                    개설자에게 문의하기
                </Button>
            )}
        </Card>
    );
}

export default MeetupAuthor;

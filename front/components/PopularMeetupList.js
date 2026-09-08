import React from "react";
import { Row, Col, Button, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import MeetupCard from "./MeetupCard";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

function PopularMeetupList({ popularMeetups, onMeetupClick, onToggleLike }) {
    const router = useRouter();
    return (
        <Row gutter={[20, 20]}>
            {/* 제목 */}
            <Col span={24}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={3}>🔥 인기 모임</Title>

                        <Text type="secondary">
                            지금 많은 사람들이 관심을 가지고 있어요
                        </Text>
                    </Col>

                    <Col>
                        <Button
                            type="link"
                            onClick={() => router.push("/user/meetup")}
                        >
                            전체보기
                            <RightOutlined />
                        </Button>
                    </Col>
                </Row>
            </Col>

            {/* 모임 목록 */}
            {popularMeetups.map((meetup) => (
                <Col xs={24} sm={12} lg={6} key={meetup.id}>
                    <MeetupCard
                        meetup={meetup}
                        onClick={onMeetupClick}
                        onToggleLike={onToggleLike}
                    />
                </Col>
            ))}
        </Row>
    );
}

export default PopularMeetupList;

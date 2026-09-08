import React, { useEffect } from "react";
import { Card, Space, Row, Button, Typography, message } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { applyMeetupRequest, resetApplyState } from "../reducers/meetupReducer";

const { Text } = Typography;

function MeetupRecruitInfo({ meetup, isOwner }) {
    const dispatch = useDispatch();

    const { applySuccess, applyError } = useSelector((state) => state.meetup);

    const handleApply = () => {
        dispatch(applyMeetupRequest(meetup.id));
    };

    const handleEdit = () => {
        // 수정 페이지로 이동
        window.location.href = `/user/meetup/write?meetupId=${meetup.id}`;
    };

    const isApplied =
        meetup.applyStatus === "PENDING" || meetup.applyStatus === "APPROVED";
    const isNoShow = meetup.applyStatus === "NOSHOW";

    //console.log(meetup);
    useEffect(() => {
        if (applySuccess) {
            if (meetup?.applyStatus === "PENDING") {
                message.success("모임 신청이 완료되었습니다.");
            } else {
                message.success("모임 신청이 취소되었습니다.");
            }

            dispatch(resetApplyState());
        }

        if (applyError) {
            message.error(applyError);
            dispatch(resetApplyState());
        }
    }, [applySuccess, applyError, meetup, dispatch]);

    return (
        <Card title="모집 정보" className="meetup-side-card">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row justify="space-between">
                    <Text type="secondary">모임일시</Text>

                    <Text strong>
                        {meetup.meetupAt.replace("T", " ").slice(0, 16)}
                    </Text>
                </Row>

                <Row justify="space-between">
                    <Text type="secondary">인원(최소/최대)</Text>

                    <Text strong>
                        {meetup.minParticipants} / {meetup.maxParticipants}
                    </Text>
                </Row>

                <Row justify="space-between">
                    <Text type="secondary">지역</Text>

                    <Text strong>
                        <EnvironmentOutlined /> {meetup.address}
                    </Text>
                </Row>

                {meetup.meetupStatus === "RECRUITING" &&
                    (isOwner ? (
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleEdit}
                        >
                            수정하기
                        </Button>
                    ) : (
                        <Button
                            type={isApplied ? "default" : "primary"}
                            size="large"
                            block
                            onClick={handleApply}
                            disabled={isNoShow}
                        >
                            {isNoShow
                                ? "신청불가"
                                : isApplied
                                  ? "신청취소"
                                  : "신청하기"}
                        </Button>
                    ))}
            </Space>
        </Card>
    );
}

export default MeetupRecruitInfo;

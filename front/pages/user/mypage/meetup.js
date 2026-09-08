import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    Space,
    Table,
    Tag,
    Typography,
    Modal,
    message,
} from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    StarOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import {
    fetchMyMeetupsRequest,
    fetchMeetupApplicantsRequest,
    updateApplicationStatusRequest,
    fetchMyMeetupCountRequest,
    deleteMeetupRequest,
    resetDeleteSuccess,
    boostMeetupRequest,
    resetBoostSuccess,
} from "../../../reducers/meetupReducer";
import MeetupApplicantModal from "../../../components/MeetupApplicantModal";
import MyPageStatCard from "../../../components/MyPageStatCard";

// http://localhost:3000/user/mypage/meetup

const { Title, Text } = Typography;

function UserMyMeetupPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // 신청자관리모달
    const [applicantModalOpen, setApplicantModalOpen] = useState(false);
    const [selectedMeetupId, setSelectedMeetupId] = useState(null);

    const {
        myMeetups,
        meetupApplicants,
        myMeetupCount,
        loading,
        deleteSuccess,
        boostSuccess,
        error,
        totalCount,
    } = useSelector((state) => state.meetup);

    // 승인 처리
    const handleApprove = (applicationId) => {
        //console.log("신청자 승인:", selectedMeetupId);

        dispatch(
            updateApplicationStatusRequest({
                meetupId: selectedMeetupId,
                applicationId,
                applyStatus: "APPROVED",
            }),
        );
    };

    // 거절 처리
    const handleReject = ({ applicationId, rejectReason }) => {
        //console.log("신청자 거절:", selectedMeetupId);
        //console.log("거절 사유:", rejectReason);

        dispatch(
            updateApplicationStatusRequest({
                meetupId: selectedMeetupId,
                applicationId,
                applyStatus: "REJECTED",
                rejectReason, // 거절 사유도 필요 시 전달
            }),
        );
    };

    // 1. 노쇼 처리 핸들러 추가
    const handleNoShow = (applicationId) => {
        //console.log("신청자 노쇼 처리:", selectedMeetupId);

        dispatch(
            updateApplicationStatusRequest({
                meetupId: selectedMeetupId,
                applicationId,
                applyStatus: "NOSHOW",
            }),
        );
    };

    // 신청자관리
    const handleApplicantManage = (meetupId) => {
        setSelectedMeetupId(meetupId);
        setApplicantModalOpen(true);
        dispatch(
            fetchMeetupApplicantsRequest({
                meetupId,
                page: 0,
                size: 10,
            }),
        );
    };

    //삭제
    const handleDelete = (meetupId) => {
        Modal.confirm({
            title: "모임을 삭제하시겠습니까?",
            content: "삭제한 모임은 다시 복구할 수 없습니다.",
            okText: "삭제",
            cancelText: "취소",
            okButtonProps: {
                danger: true,
            },
            onOk: () => {
                dispatch(deleteMeetupRequest({ meetupId }));
            },
        });
    };

    // 끌어올리기
    const handleBoost = (meetupId) => {
        Modal.confirm({
            title: "모임을 끌어올리시겠습니까?",
            content: "200 포인트가 차감되며, 7일에 한 번만 사용할 수 있습니다.",
            okText: "끌어올리기",
            cancelText: "취소",
            onOk: () => {
                dispatch(boostMeetupRequest(meetupId));
            },
        });
    };

    // 통계
    const stats = [
        {
            title: "내 모집글",
            value: myMeetupCount.myMeetupCount,
            suffix: "개",
            icon: FileTextOutlined,
        },
        {
            title: "신청 모임",
            value: myMeetupCount.applicationCount,
            suffix: "개",
            icon: TeamOutlined,
        },
        {
            title: "작성 후기",
            value: myMeetupCount.reviewCount,
            suffix: "개",
            icon: StarOutlined,
        },
        {
            title: "관심 모임",
            value: myMeetupCount.favoriteCount,
            suffix: "개",
            icon: HeartOutlined,
        },
    ];

    useEffect(() => {
        dispatch(
            fetchMyMeetupsRequest({
                page: currentPage - 1,
                size: pageSize,
            }),
        );
    }, [dispatch, currentPage]);

    useEffect(() => {
        dispatch(fetchMyMeetupCountRequest());
    }, [dispatch]);

    useEffect(() => {
        if (!deleteSuccess) return;

        message.success("모임이 삭제되었습니다.");

        dispatch(
            fetchMyMeetupsRequest({
                page: currentPage - 1,
                size: pageSize,
            }),
        );

        dispatch(fetchMyMeetupCountRequest());

        dispatch(resetDeleteSuccess());
    }, [deleteSuccess, dispatch, currentPage]);

    useEffect(() => {
        if (!boostSuccess) return;

        message.success("모임이 끌어올려졌습니다.");

        dispatch(
            fetchMyMeetupsRequest({
                page: currentPage - 1,
                size: pageSize,
            }),
        );
        dispatch(resetBoostSuccess());
    }, [boostSuccess, dispatch]);

    useEffect(() => {
        if (!error) return;

        message.error(error);
    }, [error]);

    //console.log(myMeetups);

    // 테이블
    const columns = [
        {
            title: "번호",
            key: "number",
            align: "center",
            render: (_, record, index) =>
                totalCount - ((currentPage - 1) * pageSize + index),
        },
        {
            title: "모임명",
            dataIndex: "title",
            key: "title",
            render: (title, record) => (
                <Text
                    strong
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                        router.push(`/user/meetup/detail?meetupId=${record.id}`)
                    }
                >
                    {title}
                </Text>
            ),
        },
        {
            title: "신청 인원",
            dataIndex: "totalParticipants",
            key: "totalParticipants",
            align: "center",
            render: (totalParticipants) => `${totalParticipants ?? 0}명`,
        },
        {
            title: "모임일",
            dataIndex: "meetupAt",
            key: "meetupAt",
            render: (meetupAt) =>
                meetupAt ? meetupAt.replace("T", " ").slice(0, 16) : "-",
        },

        {
            title: "작성일",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt) =>
                createdAt ? createdAt.replace("T", " ").slice(0, 16) : "-",
        },
        {
            title: "상태",
            dataIndex: "meetupStatus",
            key: "meetupStatus",
            align: "center",
            render: (meetupStatus) => {
                if (meetupStatus === "COMPLETED") {
                    return <Tag>종료</Tag>;
                }

                if (meetupStatus === "WEATHER_CANCELED") {
                    return <Tag color="error">기상악화 취소</Tag>;
                }

                if (meetupStatus === "CANCELED") {
                    return <Tag color="error">취소</Tag>;
                }

                return <Tag color="processing">진행중</Tag>;
            },
        },
        {
            title: "관리",
            key: "manage",
            align: "center",
            render: (_, record) => {
                const isCompleted = record.meetupStatus === "COMPLETED";
                const canBoost = record.meetupStatus === "RECRUITING";
                return (
                    <Space>
                        <Button
                            size="small"
                            disabled={isCompleted}
                            onClick={() =>
                                router.push(
                                    `/user/meetup/write?meetupId=${record.id}`,
                                )
                            }
                        >
                            수정
                        </Button>

                        <Button
                            size="small"
                            disabled={!canBoost}
                            onClick={() => handleApplicantManage(record.id)}
                        >
                            신청자 관리
                        </Button>

                        <Button
                            danger
                            size="small"
                            disabled={!canBoost}
                            onClick={() => handleDelete(record.id)}
                        >
                            삭제
                        </Button>
                        <Button
                            size="small"
                            disabled={!canBoost}
                            onClick={() => handleBoost(record.id)}
                        >
                            끌어올리기
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="mypage-container">
            {/* 통계 */}
            <MyPageStatCard stats={stats} />

            {/* 개설한 모임 */}
            <Card className="mypage-meetup-section" style={{ marginTop: 20 }}>
                <Title level={3}>개설한 모임</Title>

                <Table
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={myMeetups}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: false,
                        onChange: (page) => {
                            setCurrentPage(page);
                        },
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>

            {/* 2. onNoShow 전달 */}
            <MeetupApplicantModal
                open={applicantModalOpen}
                onCancel={() => setApplicantModalOpen(false)}
                loading={loading}
                meetupApplicants={meetupApplicants}
                onApprove={handleApprove}
                onReject={handleReject}
                onNoShow={handleNoShow}
            />
        </div>
    );
}

export default UserMyMeetupPage;

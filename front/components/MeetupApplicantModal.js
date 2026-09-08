import React, { useState } from "react";
import {
    Button,
    Input,
    message,
    Modal,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";

const { Text } = Typography;

function MeetupApplicantModal({
    open,
    onCancel,
    loading,
    meetupApplicants,
    onApprove,
    onReject,
    onNoShow,
}) {
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedApplicantId, setSelectedApplicantId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // 거절 버튼 클릭
    const handleRejectClick = (applicationId) => {
        setSelectedApplicantId(applicationId);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    // 거절하기
    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) {
            message.warning("거절 사유를 입력해주세요.");
            return;
        }

        // Optional Chaining 적용
        onReject?.({
            applicationId: selectedApplicantId,
            rejectReason: rejectReason.trim(),
        });

        setRejectModalOpen(false);
        setSelectedApplicantId(null);
        setRejectReason("");
    };

    // 노쇼 처리 핸들러 (확인 모달 띄우기)
    const handleNoShowClick = (applicationId) => {
        Modal.confirm({
            title: "노쇼 처리 확인",
            content: "해당 참가자를 노쇼 상태로 변경하시겠습니까?",
            okText: "노쇼 처리",
            okType: "danger",
            cancelText: "취소",
            onOk: () => {
                onNoShow?.(applicationId);
            },
        });
    };

    const columns = [
        {
            title: "이름",
            dataIndex: "nickname",
            key: "nickname",
        },
        {
            title: "신청일",
            dataIndex: "updateAt",
            key: "updateAt",
            render: (createdAt) =>
                createdAt ? createdAt.replace("T", " ").slice(0, 16) : "-",
        },
        {
            title: "AI 한줄평",
            dataIndex: "aiSummary",
            key: "aiSummary",
            width: 220,
            render: (aiSummary) => (
                <Text
                    ellipsis={{
                        tooltip: aiSummary || "신뢰도가 높은 회원입니다.",
                    }}
                >
                    {aiSummary || "신뢰도가 높은 회원입니다."}
                </Text>
            ),
        },
        {
            title: "신청 상태",
            dataIndex: "applyStatus",
            key: "applyStatus",
            align: "center",
            render: (status) => {
                if (status === "PENDING") {
                    return <Tag color="gold">승인 대기</Tag>;
                }

                if (status === "APPROVED") {
                    return <Tag color="green">승인</Tag>;
                }

                if (status === "REJECTED") {
                    return <Tag color="red">거절</Tag>;
                }

                if (status === "NOSHOW") {
                    return <Tag color="red">노쇼</Tag>;
                }

                return <Tag>{status}</Tag>;
            },
        },
        {
            title: "거절 사유",
            dataIndex: "rejectReason",
            key: "rejectReason",
            width: 220,
            render: (rejectReason, record) => {
                if (record.applyStatus !== "REJECTED") {
                    return "-";
                }

                return (
                    <Text ellipsis={{ tooltip: rejectReason }}>
                        {rejectReason || "-"}
                    </Text>
                );
            },
        },
        {
            title: "관리",
            key: "action",
            align: "center",
            render: (_, record) => {
                const { applyStatus, applicationId } = record;

                return (
                    <Space>
                        {/* 1. 승인 버튼: 이미 승인(APPROVED) 상태이면 비활성화 */}
                        <Button
                            type="primary"
                            size="small"
                            disabled={applyStatus === "APPROVED"}
                            onClick={() => onApprove?.(applicationId)}
                        >
                            승인
                        </Button>

                        {/* 2. 거절 버튼: 이미 거절(REJECTED) 또는 노쇼(NOSHOW) 상태이면 비활성화 */}
                        <Button
                            danger
                            size="small"
                            disabled={
                                applyStatus === "REJECTED" ||
                                applyStatus === "NOSHOW"
                            }
                            onClick={() => handleRejectClick(applicationId)}
                        >
                            거절
                        </Button>

                        {/* 3. 노쇼 버튼: 승인(APPROVED) 상태가 아닐 때(PENDING, REJECTED, NOSHOW) 비활성화 */}
                        <Button
                            danger
                            size="small"
                            disabled={applyStatus !== "APPROVED"}
                            onClick={() => handleNoShowClick(applicationId)}
                        >
                            노쇼
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            {/* 신청자 관리 Modal */}
            <Modal
                title="신청자 관리"
                open={open}
                onCancel={onCancel}
                footer={[
                    <Button key="close" onClick={onCancel}>
                        닫기
                    </Button>,
                ]}
                width={1100}
            >
                <Table
                    rowKey={(record) => record.applicationId || record.id} // 고유 키 보완
                    loading={loading}
                    columns={columns}
                    dataSource={meetupApplicants?.applicants || []}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Modal>

            {/* 거절 사유 Modal */}
            <Modal
                title="신청자 거절"
                open={rejectModalOpen}
                onCancel={() => setRejectModalOpen(false)}
                onOk={handleRejectSubmit}
                okText="거절하기"
                cancelText="취소"
                okButtonProps={{ danger: true }}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="신청자를 거절하는 사유를 입력해주세요."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={200}
                    showCount
                />
            </Modal>
        </>
    );
}

export default MeetupApplicantModal;

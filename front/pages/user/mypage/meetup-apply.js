import React, { useState, useEffect } from "react";
import { Button, Card, Table, Tag, Typography } from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    StarOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import {
    fetchMyApplicationsRequest,
    fetchMyMeetupCountRequest,
} from "../../../reducers/meetupReducer";

import MyPageStatCard from "../../../components/MyPageStatCard";

// http://localhost:3000/user/mypage/meetup

const { Title, Text } = Typography;

function UserMyMeetupApplyPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { myApplications, loading, myMeetupCount, myApplicationTotalCount } =
        useSelector((state) => state.meetup);

    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 10;

    useEffect(() => {
        //console.log("🔥 내 신청 목록 조회 dispatch");
        dispatch(
            fetchMyApplicationsRequest({
                page: currentPage - 1,
                size: 10,
            }),
        );
    }, [dispatch, currentPage]);

    //console.log(myMeetupCount);

    //통계
    useEffect(() => {
        dispatch(fetchMyMeetupCountRequest());
    }, [dispatch]);

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
    console.log(myApplications);
    // 테이블
    const columns = [
        {
            title: "번호",
            key: "number",
            align: "center",
            render: (_, record, index) =>
                myApplicationTotalCount -
                ((currentPage - 1) * pageSize + index),
        },
        {
            title: "모임명",
            dataIndex: "meetupTitle",
            key: "meetupTitle",
            render: (title, record) => (
                <Text
                    strong
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                        router.push(
                            `/user/meetup/detail?meetupId=${record.meetupId}`,
                        )
                    }
                >
                    {title}
                </Text>
            ),
        },
        {
            title: "모임일",
            dataIndex: "meetupAt",
            key: "meetupAt",
            render: (meetupAt) =>
                meetupAt ? meetupAt.replace("T", " ").slice(0, 16) : "-",
        },
        {
            title: "신청일",
            dataIndex: "updateAt",
            key: "updateAt",
            render: (updateAt) =>
                updateAt ? updateAt.replace("T", " ").slice(0, 16) : "-",
        },
        {
            title: "상태",
            dataIndex: "applyStatus",
            key: "applyStatus",
            align: "center",
            render: (status) => {
                switch (status) {
                    case "신청대기":
                        return <Tag>{status}</Tag>;

                    case "신청승인":
                        return <Tag color="processing">{status}</Tag>;

                    case "신청거절":
                        return <Tag color="error">{status}</Tag>;

                    case "노쇼":
                        return <Tag color="error">{status}</Tag>;

                    case "신청자취소":
                        return <Tag>{status}</Tag>;

                    default:
                        return <Tag>-</Tag>;
                }
            },
        },
        {
            title: "모임상태",
            dataIndex: "meetupStatus",
            key: "meetupStatus",
            align: "center",
            render: (status) => {
                switch (status) {
                    case "모집중":
                        return <Tag color="processing">{status}</Tag>;

                    case "모임완료":
                        return <Tag>{status}</Tag>;

                    case "모임취소":
                        return <Tag color="error">{status}</Tag>;

                    default:
                        return <Tag>-</Tag>;
                }
            },
        },
        // {
        //     title: "후기",
        //     dataIndex: "review",
        //     key: "review",
        //     align: "center",
        //     render: (review) => {
        //         // 후기를 작성할 수 없는 경우
        //         if (!review) {
        //             return "-";
        //         }

        //         // 이미 작성한 경우
        //         if (review === "작성완료") {
        //             return (
        //                 <Button size="small" disabled>
        //                     작성완료
        //                 </Button>
        //             );
        //         }

        //         // 작성 가능한 경우
        //         return (
        //             <Button type="primary" size="small">
        //                 후기 작성
        //             </Button>
        //         );
        //     },
        // },
    ];

    return (
        <div className="mypage-container">
            {/* 통계 */}
            <MyPageStatCard stats={stats} />

            {/* 신청한 모임 */}
            <Card className="mypage-meetup-section" style={{ marginTop: 20 }}>
                <Title level={3}>신청한 모임</Title>
                <Table
                    rowKey="applicationId"
                    loading={loading}
                    columns={columns}
                    dataSource={myApplications}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: myApplicationTotalCount,
                        showSizeChanger: false,
                        onChange: (page) => {
                            setCurrentPage(page);
                        },
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
}

export default UserMyMeetupApplyPage;

import { Row, Col, Button, Table, Spin } from "antd";
import AdminStatCard from "../../components/AdminStatCard";
import AdminSearchBox from "../../components/AdminSearchBox";
import AdminListTabs from "../../components/AdminListTabs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchMeetupsRequest,
    changeMeetupVisibilityRequest,
    fetchMeetupCountRequest,
} from "../../reducers/meetupReducer";

// http://localhost:3000/admin/meetup

function AdminMeetupPage() {
    const dispatch = useDispatch();

    const { meetups, meetupCount, loading, totalCount } = useSelector(
        (state) => state.meetup,
    );

    //console.log("관리자 모임 조회 데이터:", meetups);
    //console.log("전체 개수:", totalCount);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // 검색 조건
    const [searchType, setSearchType] = useState("all");
    const [status, setStatus] = useState("all");
    const [searchText, setSearchText] = useState("");

    const stats = [
        {
            title: "전체 모임",
            value: meetupCount.totalMeetupCount,
            suffix: "개",
        },
        { title: "모집 중", value: meetupCount.recruitingCount, suffix: "개" },
        { title: "모집 마감", value: meetupCount.completedCount, suffix: "개" },
        {
            title: "날씨로 인한 취소",
            value: meetupCount.weatherCanceledCount,
            suffix: "개",
        },
    ];

    //console.log(meetupCount);
    const adminColumns = [
        {
            title: "번호",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
            render: (_, record, index) =>
                totalCount - ((currentPage - 1) * pageSize + index),
        },
        {
            title: "모집자",
            dataIndex: "nickname",
            key: "nickname",
            width: 120,
            align: "center",
        },
        {
            title: "모집명",
            dataIndex: "title",
            key: "title",
            width: 300,
        },
        {
            title: "모집일",
            dataIndex: "meetupAt",
            key: "meetupAt",
            width: 150,
            align: "center",
            render: (meetupAt) =>
                meetupAt ? meetupAt.replace("T", " ").slice(0, 16) : "-",
        },
        {
            title: "최소모집인원",
            dataIndex: "minParticipants",
            key: "minParticipants",
            width: 120,
            align: "center",
        },
        {
            title: "최대모집인원",
            dataIndex: "maxParticipants",
            key: "maxParticipants",
            width: 120,
            align: "center",
        },
        {
            title: "신청현황",
            dataIndex: "totalParticipants",
            key: "totalParticipants",
            width: 100,
            align: "center",
            render: (value) => value ?? 0,
        },
        {
            title: "관리",
            key: "action",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Button
                    size="small"
                    danger={!record.hidden}
                    onClick={() => handlevisibilityMeetup(record.id)}
                >
                    {record.hidden ? "공개" : "비공개"}
                </Button>
            ),
        },
    ];

    // 체크박스
    const [checkStrictly, setCheckStrictly] = useState(false);

    const rowSelection = {
        checkStrictly,
        onChange: (selectedRowKeys, selectedRows) => {
            //console.log("선택된 ID:", selectedRowKeys);
            //console.log("선택된 데이터:", selectedRows);
        },
    };

    // 목록 전환
    const [listType, setListType] = useState("admin");

    const listTabs = [
        {
            key: "admin",
            label: "관리자목록",
        },
    ];

    // 검색
    const handleSearch = (values) => {
        console.log("검색 조건:", values);

        setSearchType(values.category);
        setSearchText(values.keyword || "");
        setStatus(values.status);

        // 검색하면 1페이지부터
        setCurrentPage(1);
    };

    useEffect(() => {
        dispatch(
            fetchMeetupsRequest({
                page: currentPage - 1,
                size: pageSize,

                searchType: searchType === "all" ? null : searchType,
                searchText: searchText || null,

                sidoId: null,
                categoryId: null,

                status: status === "all" ? null : status,
            }),
        );
        dispatch(fetchMeetupCountRequest());
    }, [currentPage, searchType, searchText, status, dispatch]);

    // 비공개

    const handlevisibilityMeetup = (meetupId) => {
        //console.log("비공개할 meetupId:", meetupId);
        dispatch(changeMeetupVisibilityRequest(meetupId));
    };

    //로딩처리
    if (!meetups) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                    gap: "16px",
                }}
            >
                <Spin size="large" />
                <span>모임 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <>
            {/* 통계 */}
            <Row gutter={[16, 16]}>
                {stats.map((stat) => (
                    <Col xs={24} sm={12} md={12} lg={6} key={stat.title}>
                        <AdminStatCard {...stat} />
                    </Col>
                ))}
            </Row>

            {/* 목록 탭 */}
            <AdminListTabs
                tabs={listTabs}
                activeTab={listType}
                onChange={setListType}
            />

            {/* 검색 영역 조건2개*/}
            <AdminSearchBox
                conditions={[
                    {
                        key: "category",
                        defaultValue: "all",
                        options: [
                            { value: "all", label: "전체" },
                            { value: "title", label: "모집명" },
                            { value: "name", label: "모집자" },
                        ],
                    },
                    {
                        key: "status",
                        defaultValue: "all",
                        options: [
                            { value: "all", label: "전체 상태" },
                            { value: "RECRUITING", label: "모집중" },
                            { value: "COMPLETED", label: "마감" },
                        ],
                    },
                ]}
                onSearch={handleSearch}
            />

            {/* 모임 목록 */}
            <div className="admin-table-box">
                <Table
                    rowSelection={rowSelection}
                    columns={adminColumns}
                    dataSource={meetups}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: false,
                        onChange: (page) => {
                            setCurrentPage(page);
                        },
                    }}
                    // loading={{
                    //     spinning: loading,
                    //     tip: "모임 정보를 불러오는 중입니다...",
                    // }}
                    rowKey="id"
                    scroll={{ x: 800 }}
                />
            </div>
        </>
    );
}

export default AdminMeetupPage;

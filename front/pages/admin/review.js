import { Row, Col, Button, Table, Tag, Spin, Select, Space } from 'antd';
import AdminStatCard from '../../components/AdminStatCard';
import AdminSearchBox from '../../components/AdminSearchBox';
import AdminListTabs from '../../components/AdminListTabs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    getAdminReviewListRequest,
    deleteReviewRequest,
} from '../../reducers/reviewReducer'; 

function AdminReviewPage() {
    const dispatch = useDispatch();

    const { reviews, totalCount, loading } = useSelector(
        (state) => state.review
    );

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // 검색 및 탭 조건
    const [searchType, setSearchType] = useState('all');
    const [status, setStatus] = useState('all'); // 🌟 'all', 'public', 'hidden'
    const [searchText, setSearchText] = useState('');
    const [listType, setListType] = useState('all');

    // 통계 카드 데이터 바인딩
    const publicCount = reviews ? reviews.filter((r) => r.isPublic === 'Y' || r.isPublic === true).length : 0;
    const hiddenCount = reviews ? reviews.filter((r) => r.isPublic === 'N' || r.isPublic === false).length : 0;

    const stats = [
        { title: '전체 후기', value: totalCount || 0, suffix: '개' },
        { title: '공개된 후기', value: publicCount, suffix: '개' },
        { title: '비공개 후기', value: hiddenCount, suffix: '개' },
    ];

    const listTabs = [{ key: 'all', label: '전체 후기' }];

    // 테이블 컬럼 정의
    const adminColumns = [
        {
            title: '번호',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            render: (_, record, index) => (reviews ? totalCount - ((currentPage - 1) * pageSize + index) : 0),
        },
        {
            title: '모임 번호',
            dataIndex: 'meetupId',
            key: 'meetupId',
            width: 100,
            align: 'center',
        },
        {
            title: '작성자',
            dataIndex: 'memberNickname',
            key: 'memberNickname',
            width: 120,
            align: 'center',
        },
        {
            title: '내용',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: '상태',
            dataIndex: 'isPublic',
            key: 'isPublic',
            width: 100,
            align: 'center',
            render: (isPublic) =>
                isPublic === 'N' || isPublic === false ? (
                    <Tag color="default">비공개</Tag>
                ) : (
                    <Tag color="success">공개</Tag>
                ),
        },
        {
            title: '작성일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'center',
            render: (createdAt) =>
                createdAt ? createdAt.replace('T', ' ').slice(0, 16) : '-',
        },
        {
            title: '관리',
            key: 'action',
            width: 160,
            align: 'center',
            render: (_, record) => {
                const isHidden = record.isPublic === 'N' || record.isPublic === false;
                return (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Button
                            size="small"
                            onClick={() => handleToggleVisibility(record.id)}
                        >
                            {isHidden ? '공개 전환' : '비공개 처리'}
                        </Button>
                        <Button
                            size="small"
                            danger
                            onClick={() => handleDelete(record.id)}
                        >
                            삭제
                        </Button>
                    </div>
                );
            },
        },
    ];

    // 검색 핸들러 (검색어 입력 후 검색 버튼 누를 때)
    const handleSearch = (values) => {
        setSearchType(values.category || 'all');
        setSearchText(values.keyword || '');
        setCurrentPage(1);
    };

    // 🌟 탭/드롭다운 변경 시 즉시 실행되는 핸들러
    const handleStatusChange = (value) => {
        setStatus(value);
        setCurrentPage(1);
    };

    // 💡 status 또는 검색어가 바뀔 때 즉시 백엔드로 요청 전송
    useEffect(() => {
        let mappedStatus = null;
        if (status === 'public') {
            mappedStatus = 'Y';
        } else if (status === 'hidden') {
            mappedStatus = 'N';
        }

        dispatch(
            getAdminReviewListRequest({
                page: currentPage - 1,
                size: pageSize,
                keyword: searchText || '',
                status: mappedStatus, // 'Y', 'N', 또는 null 전송
                sort: 'id,desc', 
            })
        );
    }, [currentPage, searchText, status, dispatch]);

    const handleToggleVisibility = (reviewId) => {
        dispatch({
            type: 'review/changeVisibilityRequest',
            payload: reviewId,
        });
    };

    const handleDelete = (reviewId) => {
        dispatch(deleteReviewRequest(reviewId));
    };

    if (!reviews) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '16px' }}>
                <Spin size="large" />
                <span>후기 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <>
            <Row gutter={[16, 16]}>
                {stats.map((stat) => (
                    <Col xs={24} sm={12} md={12} lg={8} key={stat.title}>
                        <AdminStatCard {...stat} />
                    </Col>
                ))}
            </Row>

            {/* <AdminListTabs tabs={listTabs} activeTab={listType} onChange={setListType} /> */}

            {/* 🌟 상단 필터 컨트롤 영역 (공개/비공개 탭 Select + 검색 박스) */}
            <div style={{ height: '20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <Space>
                    <span>상태 필터:</span>
                    <Select
                        value={status}
                        onChange={handleStatusChange}
                        style={{ width: 120 }}
                        options={[
                            { value: 'all', label: '전체 상태' },
                            { value: 'public', label: '공개' },
                            { value: 'hidden', label: '비공개' },
                        ]}
                    />
                </Space>

                <AdminSearchBox
                    // conditions={[
                    //     {
                    //         key: 'category',
                    //         defaultValue: 'all',
                    //         options: [
                    //             { value: 'all', label: '전체' },
                    //             { value: 'content', label: '내용' },
                    //             { value: 'nickname', label: '작성자' },
                    //         ],
                    //     },
                    // ]}
                    onSearch={handleSearch}
                    
                />
            </div>

            <div className="admin-table-box">
                <Table
                    columns={adminColumns}
                    dataSource={reviews}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                    }}
                    rowKey="id"
                    scroll={{ x: 800 }}
                />
            </div>
        </>
    );
}

export default AdminReviewPage;
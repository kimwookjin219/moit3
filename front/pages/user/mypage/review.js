import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Rate,
  message,
  Modal,
  List,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import MyPageStatCard from '../../../components/MyPageStatCard';

import {
  getReviewListRequest,
  deleteReviewRequest,
} from '../../../reducers/reviewReducer';

const { Title, Text } = Typography;

function UserMyReviewPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // SSR 에러 원천 차단을 위한 마운트 체크 상태
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { reviews = [], totalCount = 0, loading } = useSelector(
    (state) => state.review || {}
  );

  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sort, setSort] = useState('id,desc');

  // 리덕스 스토어에서 유저 정보 가져오기
  const memberId = useSelector((state) => {
    if (!isMounted) return null;
    const userState = state.user || {};
    const currentUser = userState.user;
    return currentUser?.id || currentUser?.memberId || null;
  });

  // 알림 목록 상태 선언
  const [notifications, setNotifications] = useState([]);

  // 알림 목록 불러오기 (백엔드 8080 포트 직접 호출하여 404 방지)
  const fetchNotifications = async () => {
    if (!memberId) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/notifications/reviews?memberId=${memberId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  
  // 🌟 [수정된 알림 클릭 핸들러] 클릭 시 백엔드 읽음 처리 API 호출 후 알림 ID와 함께 리뷰 작성 페이지로 이동
  const handleNotificationClick = async (notificationId, meetupId) => {
    try {
      await axios.patch(`http://localhost:8080/api/notifications/reviews/${notificationId}/read`);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    } finally {
      if (isMounted) {
        router.push(`/user/meetup/review/write?meetupId=${meetupId}&from=mypage&notificationId=${notificationId}`);
      }
    }
  };

  useEffect(() => {
    dispatch(
      getReviewListRequest({
        keyword: searchKeyword,
        sort: sort,
        page: 0,
        size: 10,
      })
    );
  }, [dispatch, searchKeyword, sort]);

  // 🌟 [수정된 useEffect] memberId가 로드된 이후 알림 목록 가져오기 + 마이페이지 재진입 시점 관리
  useEffect(() => {
    if (memberId) {
      fetchNotifications();
    }

    const handleRouteChange = () => {
      if (memberId) {
        fetchNotifications();
      }
    };

    router.events?.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [memberId, router]);

  const handleSearch = () => {
    setSearchKeyword(keyword);
  };

  const handleReset = () => {
    setKeyword('');
    setSearchKeyword('');
  };

  const handleSortChange = (value) => {
    if (value === 'latest') {
      setSort('id,desc');
    } else if (value === 'rating') {
      setSort('rating,desc');
    }
  };

  const handleDelete = (reviewId) => {
    Modal.confirm({
      title: '정말 후기를 삭제하시겠습니까?',
      icon: <ExclamationCircleOutlined />,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        dispatch(deleteReviewRequest(reviewId));
        message.success('후기가 삭제되었습니다.');
        dispatch(getReviewListRequest({ keyword: searchKeyword, sort, page: 0, size: 10 }));
      },
    });
  };

  const handleEdit = (reviewId, meetupId) => {
    router.push(
      `/user/meetup/review/write?reviewId=${reviewId}&meetupId=${meetupId}&edit=true&from=mypage`
    );
  };

  const columns = [
    {
      title: '모임 정보',
      dataIndex: 'meetupId',
      key: 'meetupId',
      width: '20%',
      render: (meetupId, record) => (
        <div>
          {/* 🌟 record.meetupTitle(모임 이름)을 먼저 보여주고, 없을 때만 기존처럼 모임 번호를 보여줍니다 */}
          <Text strong>{record.meetupTitle || `모임 #${meetupId}`}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.createdAt ? record.createdAt.substring(0, 10) : ''}
          </Text>
        </div>
      ),
    },
    {
      title: '후기 내용',
      dataIndex: 'content',
      key: 'content',
      width: '45%',
      render: (content, record) => (
        <div>
          <Rate
            disabled
            value={record.rating}
            style={{
              fontSize: 14,
              marginBottom: 6,
            }}
          />
          <div
            style={{
              color: '#475569',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </div>
        </div>
      ),
    },
    {
      title: '공개 상태',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: '15%',
      align: 'center',
      render: (isPublic) =>
        isPublic === 'N' ? (
          <Tag color="error" icon={<LockOutlined />}>
            비공개
          </Tag>
        ) : (
          <Tag color="blue">전체공개</Tag>
        ),
    },
    {
      title: '관리',
      key: 'action',
      width: '20%',
      align: 'center',
      render: (_, record) => {
        const currentReviewId = record.reviewId || record.id;
        const currentMeetupId = record.meetupId;
        
        return (
          <Space size={6}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(currentReviewId, currentMeetupId)}
            >
              수정
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(currentReviewId)}
            >
              삭제
            </Button>
          </Space>
        );
      },
    },
  ];

  const totalReviews = totalCount || reviews.length;
  const privateReviews = reviews.filter(
    (review) => review.isPublic === 'N'
  ).length;

  const stats = [
    {
      title: '작성 후기',
      value: totalReviews,
      suffix: '개',
      icon: FileTextOutlined,
    },
    {
      title: '비공개 후기',
      value: privateReviews,
      suffix: '개',
      icon: LockOutlined,
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mypage-reviews">
      <MyPageStatCard stats={stats} />

      {/* 후기 작성 권장 알림 위젯 */}
      {notifications && notifications.length > 0 && (
        <Card
          title={
            <Space>
              <BellOutlined style={{ color: '#fa8c16' }} />
              <span>리뷰 작성 권장 알림 ({notifications.length}개)</span>
            </Space>
          }
          style={{ marginBottom: 24, borderColor: '#ffd591', background: '#fff7e6' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    ghost
                    onClick={() => handleNotificationClick(item.id, item.meetupId)}
                  >
                    리뷰 쓰러 가기
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{item.title || `모임 #${item.meetupId} 참여가 완료되었습니다.`}</Text>}
                  description={<Text type="secondary">{item.message || '즐거운 모임 되셨나요? 다른 회원님들을 위해 후기를 남겨주세요!'}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card className="mypage-review-filter" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="후기 내용 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button type="primary" onClick={handleSearch}>
                검색
              </Button>
              <Button onClick={handleReset}>초기화</Button>
            </Space.Compact>
          </Col>

          <Col xs={24} md={6}>
            <Select
              defaultValue="latest"
              style={{ width: '100%' }}
              onChange={handleSortChange}
              options={[
                {
                  value: 'latest',
                  label: '최신순',
                },
                {
                  value: 'rating',
                  label: '별점순',
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card className="mypage-review-list">
        <Title level={3} style={{ marginBottom: 16 }}>내 작성 후기</Title>

        <Table
          columns={columns}
          dataSource={reviews}
          rowKey={(record) => record.reviewId || record.id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}

export default UserMyReviewPage;
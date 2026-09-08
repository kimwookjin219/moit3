import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Input,
  Select,
  Card,
  Typography,
  Rate,
  Progress,
  Space,
  Modal,
  Spin,
} from 'antd';
import { 
  RobotOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { analyzeReviewsRequest, resetReviewState } from '../reducers/reviewReducer'; 
import ReviewItem from './ReviewItem'; // ★ 독립 컴포넌트로 분리된 ReviewItem 임포트

const { Title, Text, Paragraph } = Typography;

function ReviewSection({ 
  reviews = [], 
  meetupId, 
  isHost = false, 
  onWriteReview, 
  onLikeReview,
  onSortChange,
  meetupStatus,
  onSearch,
  onReport  // 신고 추가 ...
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  // 검색어 및 정렬 상태 관리
  const [searchText, setSearchText] = useState('');
  const [sortValue, setSortValue] = useState('latest');

  // 모달 오픈 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux에서 AI 분석 관련 상태 가져오기
  const { analysisResult, loading: aiLoading } = useSelector((state) => {
    const reviewState = state.review || state.reviewReducer || {};
    return {
      analysisResult: reviewState.analysisResult,
      loading: reviewState.loading,
    };
  });

  // 대상 모임 ID 추출
  const targetMeetupId = meetupId || router.query.meetupId || router.query.id;

  // 비공개 후기('N')는 목록에서 제외
  const publicReviews = reviews.filter((review) => {
    const pub = review.isPublic;
    if (pub === 'N' || pub === 'n' || pub === false) {
      return false; 
    }
    return true;
  });

  // ==========================================
  // 평점 및 개수 동적 계산 로직
  // ==========================================
  const totalReviewsCount = publicReviews.length;

  const averageRating = totalReviewsCount > 0
    ? (publicReviews.reduce((acc, cur) => acc + (Number(cur.rating) || 0), 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  publicReviews.forEach((review) => {
    const rate = Math.round(Number(review.rating) || 0);
    if (rate >= 1 && rate <= 5) {
      ratingCounts[rate] += 1;
    }
  });

  const getRatingPercent = (score) => {
    if (totalReviewsCount === 0) return 0;
    return Math.round((ratingCounts[score] / totalReviewsCount) * 100);
  };
  // ==========================================

  // AI 후기 인사이트 버튼 클릭 핸들러
  const handleOpenAiModal = () => {
    if (!targetMeetupId) {
      alert('모임 정보를 찾을 수 없습니다.');
      return;
    }

    setIsModalOpen(true);
    dispatch(analyzeReviewsRequest(targetMeetupId));
  };


  // 후기 작성 이동
  const handleWriteClick = () => {
    console.log("🔍 현재 모임 상태 (meetupStatus):", meetupStatus);

    // 1. meetupStatus 값이 전달되었는데 'COMPLETED'가 아니라면 페이지 이동을 절대 시키지 않고 차단
    if (meetupStatus) {
      const statusStr = String(meetupStatus).toUpperCase();
      const isCompleted = statusStr.includes('COMPLETED') || statusStr.includes('COMPLETE') || statusStr.includes('종료');

      if (!isCompleted) {
        alert('종료된 모임에만 후기를 작성할 수 있습니다.');
        return; // 🛑 여기서 함수를 종료하므로 write 페이지로 절대 넘어가지 않습니다!
      }
    }

    dispatch(resetReviewState()); 

    if (onWriteReview) {
      onWriteReview();
      return;
    }

    if (targetMeetupId) {
      router.push(`/user/meetup/review/write?meetupId=${targetMeetupId}`);
    } else {
      alert('모임 정보(meetupId)를 찾을 수 없습니다.');
    }
  };

  // 정렬 변경 핸들러
  const handleInternalSortChange = (value) => {
    setSortValue(value);
    const sortParam = value === 'likes' ? 'likesCount,desc' : 'id,desc';

    if (onSortChange) {
      onSortChange(sortParam,searchText);
    }
  };

  // 검색 버튼 클릭 및 엔터키 입력 시 동작
  const handleSearchSubmit = (value) => {
    if (onSearch) {
      onSearch(value.trim());
    } else {
      console.warn("❌ onSearch 함수가 부모로부터 전달되지 않았습니다!");
    }
  };

  return (
    <div id="review-section">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size={12} align="center">
            <Title level={4} style={{ margin: 0 }}>모임 후기</Title>
            
            {isHost && (
              <Button
                type="dashed"
                icon={<RobotOutlined style={{ color: '#722ed1' }} />}
                style={{ borderColor: '#722ed1', color: '#722ed1', fontWeight: 500 }}
                onClick={handleOpenAiModal}
              >
                AI 후기 인사이트
              </Button>
            )}
          </Space>
        </Col>

        {!isHost && (
          <Col>
            <Button type="primary" onClick={handleWriteClick}>
              후기 작성하기
            </Button>
          </Col>
        )}
      </Row>

      {/* 검색 및 정렬 */}
      <Row gutter={12} style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Input.Search 
            placeholder="후기 검색어를 입력하세요" 
            allowClear
            enterButton="검색"
            size="middle"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearchSubmit}
          />
        </Col>

        <Col>
          <Select
            value={sortValue}
            onChange={handleInternalSortChange}
            style={{ width: 110 }}
            options={[
              { value: 'latest', label: '최신순' },
              { value: 'likes', label: '좋아요순' },
            ]}
          />
        </Col>
      </Row>

      {/* 평점 통계 카드 */}
      <Card className="review-rating-card">
        <Row gutter={40} align="middle">
          <Col xs={24} sm={8}>
            <div className="review-score" style={{ textAlign: 'center' }}>
              <Title level={1} style={{ margin: 0 }}>{averageRating}</Title>
              <Rate disabled allowHalf value={Number(averageRating)} style={{ margin: '8px 0' }} />
              <div><Text type="secondary">총 후기 {totalReviewsCount}개</Text></div>
            </div>
          </Col>

          <Col xs={24} sm={16}>
            {[5, 4, 3, 2, 1].map((score) => (
              <Row key={score} align="middle" gutter={8} style={{ marginBottom: 4 }}>
                <Col flex="40px">
                  <Text>{score}점</Text>
                </Col>

                <Col flex="auto">
                  <Progress
                    percent={getRatingPercent(score)}
                    showInfo={false}
                  />
                </Col>

                <Col flex="30px" style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{ratingCounts[score]}</Text>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </Card>

      {/* 후기 목록 (ReviewItem 컴포넌트를 사용하도록 수정 완료) */}
      <Space
        direction="vertical"
        size={16}
        style={{
          width: '100%',
          marginTop: 20,
        }}
      >

        {publicReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            targetMeetupId={targetMeetupId}
            onLikeReview={onLikeReview}
          />
        ))}
      </Space>

      {/* AI 후기 분석 결과 모달 */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#722ed1' }} />
            <span>AI 모임 후기 인사이트</span>
          </Space>
        }
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            확인
          </Button>,
        ]}
        width={600}
      >
        <div style={{ minHeight: '150px', padding: '10px 0' }}>
          {aiLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#722ed1' }} spin />} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">AI가 모임 후기를 분석하고 있습니다...</Text>
              </div>
            </div>
          ) : (
            <div>
              <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {analysisResult || '분석된 후기 내용이 없거나 결과가 비어있습니다.'}
              </Paragraph>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ReviewSection;
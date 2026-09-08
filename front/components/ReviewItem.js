import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Avatar, Typography, Rate, Image, Button } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons';
import { useRouter } from 'next/router';
import ReviewComments from './ReviewComment';

const { Text, Paragraph } = Typography;

const BACKEND_URL = 'http://localhost:8080';

const getImageUrl = (imgItem) => {
  if (!imgItem) return null;
  const target = imgItem.image || imgItem;
  if (typeof target === 'number') return `${BACKEND_URL}/api/images/${target}`;
  if (typeof target === 'string') {
    if (target.startsWith('http')) return target;
    if (!isNaN(target)) return `${BACKEND_URL}/api/images/${target}`;
    return `${BACKEND_URL}${target.startsWith('/') ? '' : '/'}${target}`;
  }
  const url = target.filePath || target.imageUrl || target.url || target.path || target.imagePath;
  if (url) {
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (cleanPath.startsWith('/upload')) return `${BACKEND_URL}${cleanPath}`;
    return `${BACKEND_URL}/upload/review${cleanPath}`;
  }
  const id = target.imageId || target.id || target.reviewImageId;
  if (id) return `${BACKEND_URL}/api/images/${id}`;
  return null;
};

export default function ReviewItem({ review, targetMeetupId, onLikeReview }) {
  const router = useRouter();

  // 서버에서 내려온 최신 값 추출
  const serverLiked = Boolean(review.liked || review.isLiked);
  const serverLikesCount = review.likesCount ?? review.likes ?? 0;

  // 로컬 UI 상태 (즉각적인 반응을 위해 유지)
  const [isLiked, setIsLiked] = useState(serverLiked);
  const [likesCount, setLikesCount] = useState(serverLikesCount);

  
  useEffect(() => {
    setIsLiked(serverLiked);
    setLikesCount(serverLikesCount);
  }, [serverLiked, serverLikesCount]);

  const handleDetailClick = (reviewId) => {
    if (!reviewId) return;
    if (targetMeetupId) {
      router.push(`/user/meetup/review/detailreview?reviewId=${reviewId}&meetupId=${targetMeetupId}`);
    } else {
      router.push(`/user/meetup/review/detailreview?reviewId=${reviewId}`);
    }
  };

  const handleToggleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (onLikeReview) {
      onLikeReview(review.id);
    }
  };

  const imageList = review.images || review.reviewImages || review.imageUrls || review.reviewImageList || [];

  return (
    <Card className="review-card">
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Text strong>{review.memberNickname || review.nickname || '작성자'}</Text>
              <div>
                <Text type="secondary">
                  {review.createdAt ? String(review.createdAt).substring(0, 10) : ''}
                </Text>
              </div>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            <Button type="default" size="small" onClick={() => handleDetailClick(review.id)}>
              상세보기
            </Button>
            <Button
              type="text"
              danger
              onClick={() => router.push(`/user/meetup/report/write?targetType=REVIEW&targetId=${review.id}`)}
            >
              신고
            </Button>
          </Space>
        </Col>
      </Row>

      <Rate disabled value={review.rating} style={{ marginTop: 12 }} />
      <Paragraph style={{ marginTop: 12 }}>{review.content}</Paragraph>

      {Array.isArray(imageList) && imageList.length > 0 && (
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <Image.PreviewGroup>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {imageList.map((imgItem, idx) => {
                const imgSrc = getImageUrl(imgItem);
                if (!imgSrc) return null;
                return (
                  <Image
                    key={imgItem?.reviewImageId || imgItem?.imageId || imgItem?.id || idx}
                    src={imgSrc}
                    alt={`review-attached-${idx}`}
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                );
              })}
            </div>
          </Image.PreviewGroup>
        </div>
      )}

      <Button
        type="text"
        icon={isLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
        style={{ color: isLiked ? '#1890ff' : 'inherit' }}
        onClick={handleToggleLike}
      >
        {likesCount}
      </Button>

      <ReviewComments reviewId={review.id} />
    </Card>
  );
}
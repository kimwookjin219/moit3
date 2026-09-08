import React, { useEffect } from 'react';
import { Card, Button, Typography, Space, Rate, Avatar, Image, Divider } from 'antd';
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  LikeOutlined,
  EyeOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

// 리듀서 파일 위치에 맞춰 경로 확인
import {
  getReviewDetailRequest,
  deleteReviewRequest,
} from '../../../../reducers/reviewReducer';

const { Text, Paragraph } = Typography;

const BACKEND_URL = 'http://localhost:8080'; // 본인 백엔드 주소

// 목록 페이지와 동일하게 업그레이드된 이미지 URL 처리 유틸 함수
const getImageUrl = (imgItem) => {
  if (imgItem === null || imgItem === undefined) return null;

  // 1. 백엔드 엔티티 구조상 imgItem 안에 image 객체가 포함되어 있다면 추출
  const target = imgItem.image || imgItem;

  if (typeof target === 'number') {
    return `${BACKEND_URL}/api/images/${target}`;
  }

  if (typeof target === 'string') {
    if (target.startsWith('http')) return target;
    if (!isNaN(target)) return `${BACKEND_URL}/api/images/${target}`;
    return `${BACKEND_URL}${target.startsWith('/') ? '' : '/'}${target}`;
  }

  // 2. 객체 안에서 파일 경로 필드 체크 (filePath 추가)
  const url = target.filePath || target.imageUrl || target.url || target.path || target.imagePath;
  if (url) {
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (cleanPath.startsWith('/upload')) {
      return `${BACKEND_URL}${cleanPath}`;
    }
    return `${BACKEND_URL}/upload/review${cleanPath}`;
  }

  // 3. 경로가 없고 아이디만 있는 경우
  const id = target.imageId || target.id || target.reviewImageId;
  if (id) {
    return `${BACKEND_URL}/api/images/${id}`;
  }

  return null;
};

function DetailReviewPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // URL Query에서 reviewId와 meetupId 추출
  const { reviewId, meetupId } = router.query;

  const { reviewDetail, loading } = useSelector((state) => state.review || {});

  // 1. 리뷰 상세 데이터 요청
  useEffect(() => {
    if (!router.isReady || !reviewId) return;
    dispatch(getReviewDetailRequest(Number(reviewId)));
  }, [dispatch, router.isReady, reviewId]);

  // 2. 리뷰 삭제 핸들러
  const handleDelete = () => {
    if (confirm('정말 후기를 삭제하시겠습니까?')) {
      dispatch(deleteReviewRequest(Number(reviewId)));
      alert('삭제되었습니다.');

      if (meetupId) {
        router.push(`/user/meetup/detail?meetupId=${meetupId}&tab=review`);
      } else {
        router.back();
      }
    }
  };

  // 백엔드 이미지 배열 처리
  const images = 
    reviewDetail?.images || 
    reviewDetail?.reviewImages || 
    reviewDetail?.imageUrls || 
    reviewDetail?.reviewImageList || 
    [];

  console.log("🔍 현재 백엔드에서 받아온 reviewDetail 전체 데이터:", reviewDetail);

  return (
    <div style={{ padding: '16px', maxWidth: '680px', margin: '0 auto' }}>
      {/* 상단 네비게이션 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ paddingLeft: 0 }}
        >
          목록으로
        </Button>
      </div>

      <Card loading={loading} bodyStyle={{ padding: '20px' }}>
        {/* 작성자 정보 및 수정/삭제 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={12}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={reviewDetail?.userImage || reviewDetail?.userProfile}
            />
            <div>
              <Text strong style={{ fontSize: '15px', display: 'block' }}>
                {reviewDetail?.memberNickname || reviewDetail?.nickname || reviewDetail?.userName || '작성자'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {reviewDetail?.createdAt
                  ? String(reviewDetail.createdAt).substring(0, 10)
                  : ''}
              </Text>
            </div>
          </Space>

          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(
                  `/user/meetup/review/write?reviewId=${reviewId}&meetupId=${meetupId}&edit=true`,
                )
              }
            >
              수정
            </Button>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              삭제
            </Button>
          </Space>
        </div>

        {/* 평점, 조회수, 좋아요 개수 영역 */}
        <div
          style={{
            margin: '16px 0 12px',
            padding: '12px 16px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rate
              disabled
              value={reviewDetail?.rating || 0}
              style={{ fontSize: 16 }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {reviewDetail?.rating ? `${reviewDetail.rating}.0` : '0.0'}
            </Text>
          </div>

          {/* 조회수 및 좋아요 개수 */}
          <Space size={12}>
            <Space size={4}>
              <EyeOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                조회 {reviewDetail?.viewsCount ?? reviewDetail?.viewCount ?? reviewDetail?.views ?? 0}
              </Text>
            </Space>

            <Space size={4}>
              <LikeOutlined style={{ color: '#ff4d4f' }} />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                좋아요 {reviewDetail?.likesCount ?? reviewDetail?.likes ?? 0}
              </Text>
            </Space>
          </Space>
        </div>

        {/* 리뷰 본문 */}
        <Paragraph
          style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#262626',
            marginBottom: 20,
            whiteSpace: 'pre-wrap',
            minHeight: '80px',
          }}
        >
          {reviewDetail?.content || '등록된 후기 내용이 없습니다.'}
        </Paragraph>

        <Divider style={{ margin: '16px 0' }} />

        {/* 리뷰 이미지 목록 영역 (사진이 있을 때와 없을 때 모두 표시) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 10 }}>
            <PictureOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: '14px' }}>첨부 이미지</Text>
          </div>

          {images.length > 0 ? (
            <Image.PreviewGroup>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    images.length === 1
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px',
                }}
              >
              
                {images.map((imgItem, index) => {
                  const imgSrc = getImageUrl(imgItem);
                  if (!imgSrc) return null;

                  return (
                    <div
                      key={imgItem?.reviewImageId || imgItem?.imageId || imgItem?.id || index}
                      style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                      }}
                    >
                      <Image
                        src={imgSrc}
                        alt={`review-img-${index}`}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </Image.PreviewGroup>
          ) : (
            <div
              style={{
                padding: '20px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                textAlign: 'center',
                color: '#bfbfbf',
                fontSize: '13px',
                border: '1px dashed #d9d9d9',
              }}
            >
              첨부된 이미지가 없습니다.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DetailReviewPage;
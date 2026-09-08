import React, { useState, useEffect, useRef } from 'react';
import { Card, Radio, Input, Button, Typography, Divider, Space, Upload, Modal } from 'antd';
import { StarFilled, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  createReviewRequest, 
  updateReviewRequest, 
  getReviewDetailRequest, 
  resetReviewState 
} from '../../../../reducers/reviewReducer';

const { Title, Text } = Typography;
const { TextArea } = Input;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function ReviewWritePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, success, error, reviewDetail } = useSelector((state) => {
    if (!state) return {};
    return state.review || state.reviewReducer || {};
  });

  const [rating, setRating] = useState(3);
  const [isPublic, setIsPublic] = useState('Y');
  const [content, setContent] = useState('');

  // 이미지 상태
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 다중 선택 시 alert 창이 여러 번 뜨는 것을 방지하기 위한 ref 플래그
  const alertShownRef = useRef(false);

  // URL 파라미터에서 reviewId 및 meetupId 추출 (안전장치 추가)
  const queryReviewId = router.isReady ? router.query.reviewId : null;
  const queryMeetupId = router.isReady ? (router.query.meetupId || router.query.id || router.query.meetup_id) : null;
  
  // 마이페이지에서 왔는지 여부 파악 (알림 ID도 함께 파라미터로 넘어왔을 수 있음)
  const fromMypage = router.isReady ? router.query.from === 'mypage' : false;
  const queryNotificationId = router.isReady ? router.query.notificationId : null;

  // 수정 모드 여부 판단
  const isEditMode = Boolean(queryReviewId);

  // 💡 [디버깅 추가] 진입 시 모임 상태를 조회하여 실제 응답 데이터 구조와 상태값 확인
  useEffect(() => {
    if (!router.isReady) return;
    if (isEditMode) return; // 수정 모드일 때는 모임 상태 체크 건너뜀

    const targetMeetupId = queryMeetupId;
    if (!targetMeetupId) return;

    const checkMeetupStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/meetups/${targetMeetupId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          withCredentials: true,
        });

        // 🔍 서버 응답 데이터 구조 확인용 로그
        console.log("📥 서버에서 받은 모임 응답 전체:", response.data);

        const meetupData = response.data.data || response.data;
        const status = meetupData.meetupStatus || meetupData.status;

        console.log("🔍 추출된 최종 모임 상태값 (status):", status);

        // 종료 상태('COMPLETED')가 아닐 경우 경고 후 이전 페이지로 이동
        if (status !== 'COMPLETED') {
          alert('종료된 모임에만 후기를 작성할 수 있습니다.');
          router.back();
        }
      } catch (err) {
        console.error('모임 상태 조회 실패:', err);
      }
    };

    checkMeetupStatus();
  }, [router.isReady, isEditMode, queryMeetupId, router]);

  // 1. 수정 모드일 때 기존 리뷰 상세 정보 조회
  useEffect(() => {
    if (isEditMode && queryReviewId) {
      dispatch(getReviewDetailRequest(queryReviewId));
    }
  }, [isEditMode, queryReviewId, dispatch]);

  // 2. 조회된 기존 리뷰 데이터 폼에 채워넣기
  useEffect(() => {
    if (isEditMode && reviewDetail) {
      setContent(reviewDetail.content || '');
      setRating(reviewDetail.rating || 3);
      setIsPublic(reviewDetail.isPublic || 'Y');
      
      // 기존 이미지 매핑 (있는 경우)
      if (reviewDetail.images && Array.isArray(reviewDetail.images)) {
        const initialFiles = reviewDetail.images.map((img, idx) => {
          const rawUrl = img.imageUrl || '';
          const fullImageUrl = rawUrl.startsWith('http') 
            ? rawUrl 
            : `http://localhost:8080/upload/review/${rawUrl}`;

          return {
            uid: `-${idx}`,
            name: rawUrl.substring(rawUrl.lastIndexOf('_') + 1) || `image-${idx}.png`,
            status: 'done',
            id: img.imageId || img.reviewImageId || img.id,
            url: fullImageUrl,
            thumbUrl: fullImageUrl,
          };
        });
        setFileList(initialFiles);
      }
    }
  }, [isEditMode, reviewDetail]);

  // 3. 성공/실패 처리
  useEffect(() => {
    const handleSuccessActions = async () => {
      if (success) {
        alert(isEditMode ? '리뷰가 성공적으로 수정되었습니다.' : '리뷰가 성공적으로 등록되었습니다.');

        // 마이페이지 알림을 통해 진입해 리뷰를 등록한 경우, 서버에 읽음 처리 요청
        if (queryNotificationId) {
          try {
            await axios.patch(`http://localhost:8080/api/notifications/reviews/${queryNotificationId}/read`);
          } catch (err) {
            console.error('리뷰 등록 후 알림 읽음 처리 실패:', err);
          }
        }

        dispatch(resetReviewState());

        // 마이페이지에서 진입한 경우 마이페이지로 이동
        if (fromMypage) {
          router.push('/user/mypage/review'); 
        } else {
          const targetMeetupId = queryMeetupId || (reviewDetail && reviewDetail.meetupId) || 6;
          router.push(`/user/meetup/detail?meetupId=${targetMeetupId}&tab=review#review-section`);
        }
      }
    };

    handleSuccessActions();

    if (error) {
      console.log('🚨 최종 수신된 에러 값:', error);

      let errorMsg = '알 수 없는 오류가 발생했습니다.';

      if (typeof error === 'object') {
        const serverData = error.response?.data || error;
        
        if (typeof serverData === 'string') {
          errorMsg = serverData;
        } else {
          errorMsg = serverData.error || serverData.message || JSON.stringify(serverData);
        }
      } else {
        errorMsg = String(error);
      }

      alert(errorMsg);
      dispatch(resetReviewState());
    }
  }, [success, error, dispatch, router, queryMeetupId, isEditMode, fromMypage, reviewDetail, queryNotificationId]);

  const handleImageChange = ({ fileList: newFileList }) => {
    // 이미지가 5개를 넘어가면 5개까지만 유지하고 alert은 딱 1번만 띄우기
    if (newFileList.length > 5) {
      if (!alertShownRef.current) {
        alert('이미지는 최대 5개까지만 업로드할 수 있습니다.');
        alertShownRef.current = true;
        setTimeout(() => {
          alertShownRef.current = false;
        }, 500);
      }
      setFileList(newFileList.slice(0, 5));
      return;
    }
    setFileList(newFileList);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    const rawMeetupId = router.query.meetupId || router.query.id || router.query.meetup_id;

    if (!isEditMode && !rawMeetupId) {
      alert('모임 정보(meetupId)를 찾을 수 없습니다.');
      return;
    }

    try {
      const newFiles = fileList.filter((file) => file.originFileObj && !file.id);
      let uploadedImageIds = fileList
        .filter((file) => file.id)
        .map((file) => file.id);

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append('images', file.originFileObj);
        });

        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        const imageResponse = await axios.post('http://localhost:8080/api/reviews/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '', 
          },
          withCredentials: true,
        });

        const newImageIds = imageResponse.data;
        uploadedImageIds = [...uploadedImageIds, ...newImageIds];
      }

      const resolvedMeetupId = rawMeetupId 
        ? Number(rawMeetupId) 
        : (reviewDetail && reviewDetail.meetupId ? Number(reviewDetail.meetupId) : undefined);

      const requestDto = {
        meetupId: resolvedMeetupId,
        rating,
        isPublic,
        content: content.trim(),
        imageIds: uploadedImageIds, 
      };

      if (isEditMode) {
        dispatch(
          updateReviewRequest({
            reviewId: Number(queryReviewId),
            ...requestDto,
          })
        );
      } else {
        dispatch(createReviewRequest(requestDto));
      }
    } catch (e) {
      console.error('이미지 업로드 또는 리뷰 전송 실패:', e);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>사진 추가</div>
    </div>
  );

  return (
    <div className="review-write-page">
      <Card className="review-write-card">
        <div className="review-write-header">
          <Text className="review-write-badge">
            {isEditMode ? '리뷰 수정' : '리뷰 등록'}
          </Text>
          <Title level={2} className="review-write-title">
            {isEditMode ? '작성하신 리뷰를 수정하시겠어요?' : '방문하신 "모임"은 만족스러우셨나요?'}
          </Title>
          <Text type="secondary">
            {isEditMode ? '변경할 솔직한 후기를 남겨주세요.' : '모임에 대한 솔직한 후기를 남겨주세요.'}
          </Text>
        </div>

        <Divider />

        {/* 별점 */}
        <div className="review-write-field">
          <Title level={5}>평가 별점</Title>
          <div className="review-star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarFilled
                key={star}
                className={star <= rating ? 'review-star active' : 'review-star'}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Text type="secondary">{rating}점을 선택하셨습니다.</Text>
        </div>

        {/* 공개 설정 */}
        <div className="review-write-field">
          <Title level={5}>공개 설정</Title>
          <div className="review-public-box">
            <div>
              <Text strong>리뷰 공개 여부</Text>
              <div>
                <Text type="secondary">
                  다른 이용자들에게 후기를 공개할지 선택합니다.
                </Text>
              </div>
            </div>
            <Radio.Group
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value)}
            >
              <Radio value="Y">공개</Radio>
              <Radio value="N">비공개</Radio>
            </Radio.Group>
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="review-write-field">
          <Title level={5}>상세 내용</Title>
          <TextArea
            rows={6}
            maxLength={500}
            showCount
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="다른 이용자들에게 도움이 될 수 있도록 솔직한 경험과 소감을 남겨주세요."
          />
        </div>

        {/* 사진 첨부 */}
        <div className="review-write-field" style={{ marginTop: 24 }}>
          <Title level={5}>
            사진 첨부 <Text type="secondary" style={{ fontSize: 13, fontWeight: 'normal' }}>(선택)</Text>
          </Title>

          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleImageChange}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>

          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
          >
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>

        {/* 버튼 */}
        <div className="review-write-actions" style={{ marginTop: 32 }}>
          <Space>
            <Button size="large" onClick={() => router.back()}>
              취소
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
            >
              {isEditMode ? '리뷰 수정하기' : '리뷰 등록하기'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default ReviewWritePage;
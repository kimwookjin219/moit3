import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Card,
  Descriptions,
  Image,
  Tag,
  Space,
  message,
  Spin,
  Divider,
  Row,   
  Col,
} from 'antd';

import {
  getAdvertiseDetail,
  deleteAdvertise,
} from '../../../api/advertiseApi';

import AdvertisePayment from '../../../components/AdvertisePayment';
import { Modal } from 'antd';

function AdvertiseDetailPage() {
  const router = useRouter();
  const { adId } = router.query;

  const [advertise, setAdvertise] = useState(null);
  const [loading, setLoading] = useState(false);

  // 결제 모달 상태 추가
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 상단 결제하기 버튼에 연결할 함수
  const handlePaymentClick = () => {
    setIsPaymentModalOpen(true);
  };

  // 광고 상세 조회
  const loadAdvertiseDetail = async () => {
    if (!adId) return;

    try {
      setLoading(true);

      const response = await getAdvertiseDetail(adId);

      setAdvertise(response.data);

    } catch (error) {
      console.error('광고 상세 조회 실패');

      message.error(
        error.response?.data?.message ||
        '광고 정보를 불러오지 못했습니다.'
      );

      router.push('/user/mypage/advertiseList');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    loadAdvertiseDetail();
  }, [router.isReady, adId]);

  // 수정
  const handleEdit = () => {
    router.push(
      `/user/mypage/advertiseWrite?adId=${adId}`
    );
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?\n삭제한 광고는 목록에서 더 이상 확인할 수 없습니다.')) {
      return;
    }

    try {
      await deleteAdvertise(adId);

      message.success('광고가 삭제되었습니다.');

      router.push('/user/mypage/advertiseList');

    } catch (error) {
      console.error('광고 삭제 실패', error);

      message.error(
        error.response?.data?.message ||
        '광고 삭제에 실패했습니다.'
      );
    }
  };

  // 목록
  const handleList = () => {
    router.push('/user/mypage/advertiseList');
  };

  if (loading || !advertise) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
        }}
      >
        <Spin />
      </div>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <div style={{ padding: 24 }}>

      {/* 제목 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          광고 상세
        </h2>

        <Space>
          {advertise.approvalStatus === 'APPROVED' &&
             advertise.paymentStatus === 'WAITING' && (
             <Button type="primary" onClick={handlePaymentClick}>
                결제하기
             </Button>
          )}
          <Button onClick={handleList}>
            목록
          </Button>

          {advertise.paymentStatus !== 'PAID' && (
            <Button onClick={handleEdit}>
              수정
            </Button>
          )}

          <Button
            danger
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Space>
      </div>

      {/* 기본 정보 */}
      <Card
        title="광고 정보"
        style={{ marginBottom: 20 }}
      >
        <Descriptions
          bordered
          column={2}
        >
          <Descriptions.Item label="광고명" span={2}>
            {advertise.title}
          </Descriptions.Item>

          <Descriptions.Item label="승인 상태">
            {advertise.approvalStatus === 'APPROVED' ? (
              <Tag color="green">승인완료</Tag>
            ) : advertise.approvalStatus === 'REJECTED' ? (
              <Tag color="red">반려</Tag>
            ) : (
              <Tag color="orange">승인대기</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="운영 상태">
            {advertise.status === 'OPEN' ? (
              <Tag color="blue">진행중</Tag>
            ) : advertise.status === 'CLOSED' ? (
              <Tag>종료</Tag>
            ) : (
              <Tag color="orange">대기</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="광고 등급">
            {advertise.adGrade === 'PREMIUM' ? (
              <Tag color="gold">PREMIUM</Tag>
            ) : (
              <Tag>GENERAL</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="결제 상태">
            {advertise.approvalStatus !== 'APPROVED' ? (
                <Tag color="default">
                승인 후 결제 가능
                </Tag>
            ) : advertise.paymentStatus === 'PAID' ? (
                <Tag color="green">
                결제완료
                </Tag>
            ) : advertise.paymentStatus === 'WAITING' ? (
                <Tag color="orange">
                결제대기
                </Tag>
            ) : advertise.paymentStatus === 'FAILED' ? (
                <Tag color="red">
                결제실패
                </Tag>
            ) : (
                <Tag>
                -
                </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="광고 기간">
            {formatDateTime(advertise.startDatetime)}
            {' ~ '}
            {formatDateTime(advertise.endDatetime)}
          </Descriptions.Item>

          <Descriptions.Item label="가격 계산">
            <div>
              <div>
                광고 기간: {advertise.totalDays}일
              </div>

              <div>
                기본 광고비: {formatMoney(advertise.basePrice)}
              </div>

              <div>
                위치 추가금: +{formatMoney(advertise.positionPrice)}
              </div>

              <div style={{ fontWeight: 'bold', marginTop: 8 }}>
                예상 광고비: {formatMoney(advertise.calculatedAmount)}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="총 예산">
            {formatMoney(advertise.totalBudget)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 반려 사유 */}
      {advertise.rejectReason && (
        <Card title="반려 정보 (수정해서 다시 제출해주세요.)" style={{ marginBottom: 20, borderColor: '#ffa39e' }}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="반려 사유" labelStyle={{ color: '#cf1322' }}>
              <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{advertise.rejectReason}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 타겟 정보 */}
      <Card
        title="타겟 설정"
        style={{ marginBottom: 20 }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="최소 연령">
            {advertise.targetAgeMin
              ? `${advertise.targetAgeMin}세`
              : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="최대 연령">
            {advertise.targetAgeMax
              ? `${advertise.targetAgeMax}세`
              : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="성별">
            {formatGender(advertise.targetGender)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 광고 내용 */}
      <Card
        title="광고 내용"
        style={{ marginBottom: 20 }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="랜딩 URL">
            {advertise.landingUrl || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="내용">
            <div
              style={{
                whiteSpace: 'pre-wrap',
                minHeight: 100,
              }}
            >
              {advertise.content}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 이미지 */}
      <Card title="광고 이미지" style={{ marginBottom: 20 }}>
        {advertise.imageList && advertise.imageList.length > 0 ? (
          <Row gutter={[16, 16]}> 
            {advertise.imageList.map((image) => (
              <Col xs={24} sm={12} md={12} key={image.imageId || image.imageUrl}>
                <div style={{ background: '#fafafa', padding: 10, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                  <Image
                    src={`${BASE_URL}${image.imageUrl}`}
                    alt={advertise.title}
                    style={{ width: '100%', height: 200, objectFit: 'contain' }} 
                  />
                  <div style={{ marginTop: 8, textAlign: 'center', color: '#888', fontWeight: 'bold' }}>
                    {image.imageType || '기본 이미지'}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div>등록된 이미지가 없습니다.</div>
        )}
      </Card>

      {/* 결제 모달 추가 (return 영역 제일 아래) */}
      <Modal
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        {advertise && (
          <AdvertisePayment 
            adId={advertise.adId} 
            amount={advertise.totalBudget} 
            adTitle={advertise.title} 
          />
        )}
      </Modal>
    </div>
  );
}


/* ==========================================
   헬퍼 함수들 
========================================== */

function ApprovalStatusTag({ value }) {
  if (value === 'APPROVED') return <Tag color="green">승인완료</Tag>;
  if (value === 'REJECTED') return <Tag color="red">반려</Tag>;
  return <Tag color="orange">승인대기</Tag>;
}

function AdStatusTag({ value }) {
  if (value === 'OPEN') return <Tag color="blue">진행중</Tag>;
  if (value === 'CLOSED') return <Tag>종료</Tag>;
  return <Tag color="orange">대기</Tag>;
}

function AdGradeTag({ value }) {
  if (value === 'PREMIUM') return <Tag color="gold">PREMIUM</Tag>;
  return <Tag>GENERAL</Tag>;
}

function PaymentStatusTag({ approvalStatus, paymentStatus }) {
  if (approvalStatus !== 'APPROVED') return <Tag color="default">승인 후 결제 가능</Tag>;
  if (paymentStatus === 'PAID') return <Tag color="green">결제완료</Tag>;
  if (paymentStatus === 'FAILED') return <Tag color="red">결제실패</Tag>;
  return <Tag color="orange">결제대기</Tag>;
}

function formatGender(value) {
  if (value === 'MALE' || value === 'M') return '남성';
  if (value === 'FEMALE' || value === 'F') return '여성';
  if (value === 'ALL') return '전체';
  return value || '-';
}

function formatDate(value) {
  if (!value) return '-';
  return String(value).substring(0, 10);
}

function formatMoney(value) {
  if (value == null) return '-';
  return `${Number(value).toLocaleString()}원`;
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value)
    .replace('T', ' ')
    .substring(0, 16); // 혹은 초까지 보여주려면 19
}

export default AdvertiseDetailPage;
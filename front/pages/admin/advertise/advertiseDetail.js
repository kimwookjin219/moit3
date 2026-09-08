import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Image,
  Row,
  Col,
  Spin,
  message,
  Divider,
} from 'antd';

import {
  getAdvertiseAdminDetail,
  approveAdvertise,
  rejectAdvertise,
} from '../../../api/advertiseAdminApi';

function AdvertiseDetailPage() {
  const router = useRouter();
  const { adId, tab } = router.query;

  const [advertise, setAdvertise] = useState(null);
  const [loading, setLoading] = useState(false);

  // 이미지용
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 상세 조회
  const loadDetail = async () => {
    if (!adId) return;

    try {
      setLoading(true);
      const response = await getAdvertiseAdminDetail(adId);

      setAdvertise(response.data);
    } catch (error) {
      console.error('광고 상세 조회 실패', error);
      message.error('광고 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      loadDetail();
    }
  }, [router.isReady, adId]);

  // 목록으로
  const handleBack = () => {
    router.push({
      pathname: '/admin/advertise',
      query: {
        tab: tab || 'approval',
      },
    });
  };

  // 승인
  const handleApprove = async () => {
    if (!window.confirm('이 광고를 승인하시겠습니까?')) return;

    try {
      await approveAdvertise(adId);
      message.success('광고가 승인되었습니다.');
      await loadDetail();
    } catch (error) {
      console.error('광고 승인 실패', error);
      message.error(error.response?.data?.message || '광고 승인에 실패했습니다.');
    }
  };

  // 반려
  const handleReject = async () => {
    const rejectReason = window.prompt('반려 사유를 입력해주세요.');

    if (!rejectReason?.trim()) return;

    try {
      await rejectAdvertise(adId, rejectReason.trim());
      message.success('광고가 반려되었습니다.');
      await loadDetail();
    } catch (error) {
      console.error('광고 반려 실패', error);
      message.error(error.response?.data?.message || '광고 반려에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!advertise) {
    return <Card>광고 정보를 찾을 수 없습니다.</Card>;
  }

  const imageList = advertise.imageList || [];

  return (
    <div>
      {/* 상단 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>광고 상세 (관리자)</h2>
        <Button onClick={handleBack}>목록으로</Button>
      </div>

      {/* 통계 */}
      <Card title="광고 통계" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              노출수
              <h2>{advertise.impressions ?? 0}</h2>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              클릭수
              <h2>{advertise.clicks ?? 0}</h2>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              CTR
              <h2>{calculateCtr(advertise.impressions, advertise.clicks)}</h2>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 기본 정보 */}
      <Card title="광고 정보" style={{ marginBottom: 20 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="광고 번호">{advertise.adId}</Descriptions.Item>
          <Descriptions.Item label="광고주">{advertise.advertiserNickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="광고명" span={2}>{advertise.title || '-'}</Descriptions.Item>
          <Descriptions.Item label="결제 상태"><PaymentStatusTag value={advertise.paymentStatus} /></Descriptions.Item>
          <Descriptions.Item label="광고 등급"><AdGradeTag value={advertise.adGrade} /></Descriptions.Item>
          <Descriptions.Item label="승인 상태"><ApprovalStatusTag value={advertise.approvalStatus} /></Descriptions.Item>
          <Descriptions.Item label="광고 상태"><AdStatusTag value={advertise.status} /></Descriptions.Item>
          <Descriptions.Item label="광고 기간">
            {formatDate(advertise.startDatetime)} {' ~ '} {formatDate(advertise.endDatetime)}
          </Descriptions.Item>
          <Descriptions.Item label="등록일">{formatDateTime(advertise.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 광고 내용 */}
      <Card title="광고 내용" style={{ marginBottom: 20 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="광고 제목">{advertise.title || '-'}</Descriptions.Item>
          <Descriptions.Item label="광고 내용">
            <div style={{ whiteSpace: 'pre-wrap', minHeight: 100 }}>{advertise.content || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="랜딩 URL">
            {advertise.landingUrl ? (
              <a href={advertise.landingUrl} target="_blank" rel="noreferrer">{advertise.landingUrl}</a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 광고 타겟 */}
      <Card title="광고 타겟" style={{ marginBottom: 20 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="최소 연령">{advertise.targetAgeMin != null ? `${advertise.targetAgeMin}세` : '-'}</Descriptions.Item>
          <Descriptions.Item label="최대 연령">{advertise.targetAgeMax != null ? `${advertise.targetAgeMax}세` : '-'}</Descriptions.Item>
          <Descriptions.Item label="성별">{formatGender(advertise.targetGender)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 이미지 */}
      <Card title="광고 이미지" style={{ marginBottom: 20 }}>
        {imageList.length > 0 ? (
          <Row gutter={[16, 16]}>
            {imageList.map((image) => (
              <Col xs={24} sm={12} md={8} key={image.imageId || image.imageUrl}>
                <div style={{ background: '#fafafa', padding: 10, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                  <Image
                    src={`${BASE_URL}${image.imageUrl}`}
                    alt={advertise.title}
                    style={{ width: '100%', height: 180, objectFit: 'contain' }}
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

      {/* 결제 정보 */}
      <Card title="결제 정보" style={{ marginBottom: 20 }}>
        <Descriptions bordered column={2}>

          <Descriptions.Item label="예상 결제 금액">
            {formatPrice(advertise.calculatedAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="기본 / 추가 금액">
            {formatPrice(
              advertise.baseAmount ?? advertise.basePrice
            )}
            {' / '}
            {formatPrice(
              advertise.positionAmount ?? advertise.positionPrice
            )}
          </Descriptions.Item>

          <Descriptions.Item label="결제 유형">
            {formatPaymentType(advertise.paymentType)}
          </Descriptions.Item>

          <Descriptions.Item label="결제 상태">
            <PaymentStatusTag
              value={advertise.paymentHistoryStatus}
            />
          </Descriptions.Item>

          <Descriptions.Item label="결제 금액">
            {formatPrice(advertise.paymentAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="결제일">
            {formatDateTime(advertise.paidAt)}
          </Descriptions.Item>

          <Descriptions.Item label="주문 번호(토스)">
            {advertise.orderId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="결제 키(토스)">
            {advertise.paymentKey || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="결제 수단">
            {formatPaymentMethod(advertise.paymentMethod)}
          </Descriptions.Item>

          {advertise.paymentHistoryStatus === 'CANCELLED' && (
            <>
              <Descriptions.Item label="취소 일시">
                {formatDateTime(advertise.cancelledAt)}
              </Descriptions.Item>

              <Descriptions.Item label="취소 사유">
                {advertise.cancelReason || '-'}
              </Descriptions.Item>
            </>
          )}

        </Descriptions>
      </Card>

      <Divider />

      {/* 관리자 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <Button onClick={handleBack}>목록</Button>
        {tab === 'approval' && advertise.approvalStatus === 'WAITING' && (
          <>
            <Button type="primary" onClick={handleApprove}>승인</Button>
            <Button danger onClick={handleReject}>반려</Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   헬퍼 함수들
========================================== */

function ApprovalStatusTag({ value }) {
  if (value === 'APPROVED') return <Tag color="green">승인</Tag>;
  if (value === 'REJECTED') return <Tag color="red">반려</Tag>;
  return <Tag color="orange">승인 대기</Tag>;
}

function AdStatusTag({ value }) {
  if (value === 'OPEN') return <Tag color="green">게시 중</Tag>;
  if (value === 'CLOSED') return <Tag>종료</Tag>;
  return <Tag color="orange">게시 전</Tag>;
}

function AdGradeTag({ value }) {
  if (value === 'PREMIUM') return <Tag color="gold">PREMIUM</Tag>;
  return <Tag>GENERAL</Tag>;
}

function PaymentStatusTag({ value }) {
  if (value === 'PAID') return <Tag color="green">결제 완료</Tag>;
  if (value === 'FAILED') return <Tag color="red">결제 실패</Tag>;
  if (value === 'CANCELLED') return <Tag color="red">결제 취소</Tag>;
  return <Tag color="orange">결제 대기</Tag>;
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

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').substring(0, 19);
}

function formatPrice(value) {
  if (value == null || value === '') {
    return '-';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return '-';
  }

  return `${number.toLocaleString()}원`;
}

function formatPaymentMethod(value) {
  if (value === 'CARD') return '카드';
  if (value === 'EASY_PAY') return '간편결제';
  if (value === 'VIRTUAL_ACCOUNT') return '가상계좌';
  if (value === 'TRANSFER') return '계좌이체';
  if (value === 'MOBILE') return '휴대폰';
  if (value === 'OTHER') return '기타';

  return value || '-';
}

function calculateCtr(impressions, clicks) {
  const impressionCount = Number(impressions || 0);
  const clickCount = Number(clicks || 0);
  if (impressionCount === 0) return '0.00%';
  return ((clickCount / impressionCount) * 100).toFixed(2) + '%';
}

function formatPaymentType(value) {
  if (value === 'INITIAL') return '신규 결제'; // '최초 결제', '신규 등록' 등으로 자유롭게 변경 가능
  if (value === 'EXTENSION') return '기간 연장';
  return value || '-';
}

export default AdvertiseDetailPage;
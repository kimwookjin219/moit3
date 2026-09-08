// pages/user/meetup/report/edit/[reportId].js  // 동적라우팅 사용
// 사용자 신고 수정 페이지
// PENDING 상태인 내가 작성한 신고글의 신고 사유와 상세 내용을 수정

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import {
  fetchReportsDetailRequest,
  updateReportRequest,
  resetReportState,
} from '../../../../../reducers/reportReducer';

import {
  Card, Radio, Input, Button, Typography,
  Space, Divider, message, Spin,
} from 'antd';


const { Title, Text } = Typography;
const { TextArea } = Input;

function ReportEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { reportId } = router.query;

  const {
    currentReport,
    fetchDetail,
    update,
  } = useSelector((state) => state.report);

  const [reasonCode, setReasonCode] = useState(null);
  const [reasonDetail, setReasonDetail] = useState('');

  // =========================
  // 신고 상세 조회
  // =========================
  useEffect(() => {
    if (!router.isReady || !reportId) {
      return;
    }

    dispatch(
      fetchReportsDetailRequest({
        reportId: Number(reportId),
      })
    );
  }, [router.isReady, reportId, dispatch]);

  // =========================
  // 기존 신고 데이터 form에 넣기
  // =========================
  useEffect(() => {
    if (!currentReport) {
      return;
    }

    setReasonCode(currentReport.reasonCode);
    setReasonDetail(currentReport.reasonDetail || '');
  }, [currentReport]);

  // =========================
  // 수정 성공
  // =========================
  useEffect(() => {
    if (update.success) {
      message.success('신고가 수정되었습니다.');

      router.push(`/user/meetup/report/${reportId}`);
    }
  }, [update.success, reportId, router]);

  // =========================
  // 수정 실패
  // =========================
  useEffect(() => {
    if (update.error) {
      message.error(
        typeof update.error === 'string'
          ? update.error
          : update.error?.error || '신고 수정에 실패했습니다.'
      );
    }
  }, [update.error]);

  // =========================
  // 페이지 나갈 때 상태 초기화
  // =========================
  useEffect(() => {
    return () => {
      dispatch(resetReportState());
    };
  }, [dispatch]);

  const isMeetup = currentReport?.targetType === 'MEETUP';

  const reasons = [
    { value: 'ABUSE', label: '욕설/비방' },
    { value: 'SPAM', label: '도배/스팸' },
    { value: 'FAKE_INFO', label: '허위 정보' },
    { value: 'AD', label: '광고성 게시물' },
    { value: 'NOSHOW', label: '노쇼' },

    // ...(isMeetup
    //   ? [{ value: 'NOSHOW', label: '노쇼' }]
    //   : []),

    { value: 'ETC', label: '기타' },
  ];

  // =========================
  // 수정 버튼
  // =========================
  const handleUpdate = () => {
    if (!reasonCode) {
      message.warning('신고 사유를 선택해주세요.');
      return;
    }

    dispatch(
      updateReportRequest({
        reportId: Number(reportId),
        dto: {
          targetType: currentReport.targetType,
          targetId: currentReport.targetId,
          reasonCode,
          reasonDetail,
        },
      })
    );
  };

  if (fetchDetail.loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div style={{ padding: 30 }}>
        신고 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="report-edit-page">
      <Card className="report-edit-card">

        <Title level={2}>
          신고 수정
        </Title>

        <Text type="secondary">
          신고 사유와 상세 내용을 수정해주세요.
        </Text>

        <Divider />

        {/* 신고 대상 */}
        <div className="report-edit-field">
          <Title level={5}>신고 대상</Title>

          <Text>
            {currentReport.targetType} {currentReport.targetId}번 신고글
          </Text>
        </div>

        <Divider />

        {/* 신고 사유 */}
        <div className="report-edit-field">
          <Title level={5}>
            신고 사유
            <span className="report-required"> (필수)</span>
          </Title>

          <Radio.Group
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
          >
            <Space direction="vertical">
              {reasons.map((reason) => (
                <Radio
                  key={reason.value}
                  value={reason.value}
                >
                  {reason.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

        </div>

        <Divider />

        {/* 상세 내용 */}
        <div className="report-edit-field">
          <Title level={5}>
            상세 내용
            <Text type="secondary"> (선택)</Text>
          </Title>

          <TextArea
            value={reasonDetail}
            onChange={(e) =>
              setReasonDetail(e.target.value)
            }
            maxLength={200}
            showCount
            rows={6}
            placeholder="신고 내용을 자세히 입력해주세요."
          />

        </div>

        <Divider />

        {/* 버튼 */}
        <div className="report-edit-actions">
          <Space>
            <Button onClick={() => router.back()}>취소</Button>
            <Button
              type="primary"
              loading={update.loading}
              onClick={handleUpdate}
            >
              수정 완료
            </Button>
          </Space>
        </div>

      </Card>
    </div>
  );
}

export default ReportEditPage;
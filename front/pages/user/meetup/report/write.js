// pages/user/meetup/report/write.js
// 사용자 신고 작성 페이지
// 모임 또는 리뷰를 신고할 때 신고 사유와 상세 내용을 입력

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import {
  createReportRequest,
  createAIReportDetailRequest,
  resetReportState
} from '../../../../reducers/reportReducer';
import { Card, Radio, Input, Button, Typography, Space, Divider, message } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ReportWritePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // 로그인
  // const { user } = useSelector();
  const { targetType, targetId } = router.query;
  const { aiReportDetail, create } = useSelector((state)=> state.report);

  const { aiCreate } = useSelector((state)=> state.report);

  // 검색 기능
  const [reasonCode, setReasonCode] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');

  // 신고 사유 목록
  const isMeetup = targetType === 'MEETUP';

  const title = isMeetup ? '모임 신고하기' : '후기 신고하기';

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

  // 페이지 나갈 때 success 초기화
  useEffect(() => {
    return () => {
      dispatch(resetReportState());
    };
  }, [dispatch]);

  // AI 신고 내용 생성 성공
  useEffect(()=> {
    if (aiReportDetail) {
      setReasonDetail(aiReportDetail);
    }
  }, [aiReportDetail]);
  
  // 신고 등록 성공
  useEffect(() => {
    if (create.success) {
      message.success('신고가 등록되었습니다.');
      router.push('/user/mypage/report');
    }
  }, [create.success]);
  
  // 신고 등록 실패
  useEffect(() => {
      if (create.error) {
          message.error(create.error);
      }
  }, [create.error]);

  // 키워드 작성 버튼 클릭
  const handleAICreate = () => {
      if (!keywords.trim()) {
          message.warning('키워드를 입력해주세요.');
          return;
      }
      if (!reasonCode) {
          message.warning('신고 사유를 선택해주세요.');
          return;
      }
      dispatch(
          createAIReportDetailRequest({
              keywords: keywords,
              reasonCode: reasonCode,
              targetType: targetType
          })
      );
  };

  // 신고 등록 버튼 클릭
  const handleSubmit = () => {
    if (!targetId) {
        message.error('신고 대상 ID가 없습니다.');
        return;
    }
   
    if (!targetType) {
      message.error('신고 대상 유형이 없습니다.');
      return;
    }
   
    if (!reasonCode) {
      message.warning('신고 사유를 선택해주세요.');
      return;
    }
   
    const dto = {
      targetType,
      targetId: Number(targetId),
      reasonCode,
      reasonDetail: reasonDetail || '',
    };

    console.log('신고 등록 요청:', dto);

    dispatch(createReportRequest(dto));
  };

  return (
    <div className="report-write-page">
      <Card className="report-write-card">
        <Title level={2}>{title}</Title>

        <Text type="secondary">신고 사유를 선택하고 내용을 작성해주세요.</Text>

        <Divider />

        <div className="report-write-field">
          <Title level={5}>
            신고 사유<span className="report-required">(필수)</span>
          </Title>

          <Radio.Group
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
          >
            <Space direction="vertical">
              {reasons.map((reason) => (
                <Radio key={reason.value} value={reason.value}>
                  {reason.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div className="report-write-field">
          <Title level={5}>
            AI 신고 내용 작성 <Text type="secondary">(선택)</Text>
          </Title>

          <TextArea
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            maxLength={150}
            showCount
            placeholder="키워드 예시) 욕설, 반복적인 비방, 불쾌한 표현"
            rows={4}
          />

          <Button
            type="primary"
            style={{ marginTop: 10 }}
            disabled={!reasonCode || !keywords.trim() || aiCreate.loading}
            onClick={handleAICreate}
            loading={aiCreate.loading}
          >
            {aiCreate.loading ? "AI 작성 중... ⏳" : "키워드 작성"}
          </Button>
        </div>

        <div className="report-write-field">
          <Title level={5}>
            상세 내용 <Text type="secondary">(선택)</Text>
          </Title>

          <TextArea
            name="reasonDetail"
            value={reasonDetail}
            onChange={(e) => setReasonDetail(e.target.value)}
            maxLength={200}
            showCount
            rows={6}
            placeholder="신고 내용을 자세히 입력해주세요."
          />
        </div>

        <div className="report-write-actions">
          <Space>
            <Button onClick={() => router.back()}>취소</Button>
            <Button
              type="primary"
              loading={create.loading}
              onClick={handleSubmit}
            >
              신고 등록
            </Button>
          </Space>
        </div>

      </Card>
    </div>
  );
}

export default ReportWritePage;

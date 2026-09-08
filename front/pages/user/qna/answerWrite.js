import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  qnaDetailRequest,
  qnaAnswerCreateRequest,
} from '../../../reducers/qnaReducer';

import {
  fetchMeetupDetailRequest,
} from '../../../reducers/meetupReducer';

import {
  Button,
  Card,
  Descriptions,
  Input,
  Space,
  Typography,
} from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

function answerWrite() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { questionId } = router.query;

  const { qna, loading, success, error } = useSelector((state) => state.qna);
  const { user } = useSelector((state) => state.user);
  const { meetup } = useSelector((state) => state.meetup);

  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady || !questionId) return;

    dispatch(qnaDetailRequest(Number(questionId)));
  }, [router.isReady, questionId, dispatch]);

  useEffect(() => {
    if (!qna?.parentId) return;
    if (qna?.category !== 'MEETUP') return;

    dispatch(
      fetchMeetupDetailRequest(Number(qna.parentId))
    );
  }, [qna?.parentId, qna?.category, dispatch]);

  useEffect(() => {
    if (!router.isReady || !qna) return;

    const isMeetup = qna?.category === 'MEETUP';

    if (isMeetup && !meetup) return;

    const canAnswer =
      user?.memberTypeId === 3 ||
      user?.memberTypeId === 4 ||
      (
        isMeetup &&
        user?.memberTypeId === 1 &&
        meetup?.memberId === user?.memberId
      );

    if (!canAnswer) {
      alert('답변 등록 권한이 없습니다.');
      router.back();
    }
  }, [
    router.isReady,
    qna,
    meetup,
    user,
    router,
  ]);

  useEffect(() => {
    if (!submitted || !success) return;

    alert('답변이 등록되었습니다.');
    router.push(`/user/qna/questionDetail?questionId=${questionId}`);
  }, [submitted, success, router, questionId]);

  const isMeetup = qna?.category === 'MEETUP';

  const canAnswer =
    user?.memberTypeId === 3 ||
    user?.memberTypeId === 4 ||
    (
      isMeetup &&
      user?.memberTypeId === 1 &&
      meetup?.memberId === user?.memberId
    );

  const title = isMeetup ? '모임 1:1 문의 답변' : '관리자 1:1 문의 답변';

  const createdAt = qna?.createdAt
    ? new Date(qna.createdAt).toLocaleString()
    : '-';

  const publicText = qna?.isPublic === 'N'
    ? '비공개 🔒'
    : '공개';

  const handleSubmit = () => {
    if (!questionId) return;

    if (!canAnswer) {
      alert('답변 등록 권한이 없습니다.');
      return;
    }

    if (!content.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    if (!window.confirm('답변을 등록하시겠습니까?')) return;

    setSubmitted(true);

    dispatch(
      qnaAnswerCreateRequest({
        questionId: Number(questionId),
        content: content.trim(),
      })
    );
  };

  const handleCancel = () => {
    router.back();
  };

  if (!qna) return null;

  if (isMeetup && !meetup) return null;

  if (!canAnswer) return null;

  return (
    <div className="qna-write-page">
      <div className="qna-write-header">

        <Title level={2} className="qna-write-title">
          {title}
        </Title>

        <Text type="secondary">
          문의 내용을 확인하고 답변을 작성할 수 있습니다.
        </Text>

      </div>

      <Card className="qna-write-card">
        <Title level={4}>
          문의 정보
        </Title>

        <Descriptions
          bordered
          column={1}
          size="middle"
        >
          <Descriptions.Item label="제목">
            {qna?.title || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="작성자">
            {qna?.nickname || qna?.memberId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="등록일">
            {createdAt}
          </Descriptions.Item>

          <Descriptions.Item label="문의 내용">
            <span
              style={{
                whiteSpace: 'pre-wrap',
              }}
            >
              {qna?.content || '-'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="비공개 여부">
            {publicText}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        className="qna-write-card"
        style={{ marginTop: 16 }}
      >
        <Title level={4}>
          답변 정보 입력
        </Title>

        <div style={{ marginBottom: 8 }}>
          <Text strong>
            답변 내용 <Text type="danger">*</Text>
          </Text>
        </div>

        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="답변 내용을 입력해주세요."
          autoSize={{
            minRows: 8,
            maxRows: 15,
          }}
          maxLength={1000}
          showCount
        />

        <div className="qna-write-actions">
          <Space>
            <Button
              type="primary"
              loading={loading && submitted}
              onClick={handleSubmit}
            >
              답변 등록
            </Button>

            <Button onClick={handleCancel}>
              취소
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default answerWrite;
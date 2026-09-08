import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  qnaDetailRequest,
  qnaDeleteRequest,
  qnaAnswerDeleteRequest,
  qnaSatisfactionRequest,
  qnaSatisfactionDeleteRequest,
  qnaSatisfactionReset,
  qnaSatisfactionDeleteReset,
} from '../../../reducers/qnaReducer';

import {
  fetchMeetupDetailRequest,
} from '../../../reducers/meetupReducer';

import {
  Button,
  Card,
  Descriptions,
  Divider,
  Space,
  Tag,
  Typography,
  Input,
  Rate,
} from 'antd';

const { Title, Text, Paragraph } = Typography;

function questionDetail() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { questionId } = router.query;
  const { qna, deleteSuccess, answerDeleteSuccess, satisfactionSuccess, satisfactionDeleteSuccess, error } = useSelector((state) => state.qna);

  const { user } = useSelector((state) => state.user);
  const { meetup } = useSelector((state) => state.meetup);

  const [selectedRating, setSelectedRating] = useState(null);
  const [satisfactionComment, setSatisfactionComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnswerDeleting, setIsAnswerDeleting] = useState(false);

  // 상세 조회
  useEffect(() => {
    if (!router.isReady || !questionId) return;
    dispatch(qnaDetailRequest(Number(questionId)));
  }, [router.isReady, questionId, dispatch]);

  // 모임 문의인 경우 모임 상세 조회
  useEffect(() => {
    if (!qna?.parentId) return;
    if (qna?.category !== 'MEETUP') return;

    dispatch(
      fetchMeetupDetailRequest(Number(qna.parentId))
    );
  }, [qna?.parentId, qna?.category, dispatch]);
  
  // 삭제 성공 시 알림 후 목록 이동
  useEffect(() => {
    if (!isDeleting || !deleteSuccess) return;

    alert('문의가 삭제되었습니다.');
    setIsDeleting(false);
    router.push('/user/mypage/question');
  }, [isDeleting, deleteSuccess, router]);

  // 답변 삭제 성공
  useEffect(() => {
    if (!isAnswerDeleting || !answerDeleteSuccess) return;

    alert('답변이 삭제되었습니다.');
    setIsAnswerDeleting(false);
    dispatch(qnaDetailRequest(Number(questionId)));
  }, [isAnswerDeleting, answerDeleteSuccess, questionId, dispatch]);

  useEffect(() => {
    if (error) { 
      alert(error); 
    }
  }, [error]);

  // 만족도 등록/수정 성공
  useEffect(() => {
    if (!satisfactionSuccess) return;

    alert('만족도 평가가 완료되었습니다. 감사합니다.');

    dispatch(qnaDetailRequest(Number(questionId)));
    dispatch(qnaSatisfactionReset());
  }, [satisfactionSuccess, questionId, dispatch]);

  // 만족도 삭제 성공
  useEffect(() => {
    if (!satisfactionDeleteSuccess) return;

    alert('만족도 평가가 삭제되었습니다.');

    dispatch(qnaDetailRequest(Number(questionId)));
    dispatch(qnaSatisfactionDeleteReset());
  }, [satisfactionDeleteSuccess, questionId, dispatch]);

  const isMeetup = qna?.category === 'MEETUP';

  // 답변 등록/수정/삭제 권한
  const canAnswer =
    user?.memberTypeId === 3 ||
    user?.memberTypeId === 4 ||
    (
      user?.memberTypeId === 1 &&
      meetup?.memberId === user?.memberId
    );

  const title = isMeetup ? '모임 1:1 문의 상세' : '관리자 1:1 문의 상세';

  const status = qna?.qnaStatus || 'PENDING';

  const statusText = status === 'ANSWERED'
    ? '답변완료'
    : '답변대기';

  const statusColor = status === 'ANSWERED'
    ? 'green'
    : 'orange';

  const publicText = qna?.isPublic === 'N'
    ? '비공개 🔒'
    : '공개';

  const answer = qna?.answer || {};

  // =========================================================
  // 만족도 평가 권한
  // =========================================================

  // 문의 작성자 여부
  const isQuestionWriter =
    Number(user?.memberId) === Number(qna?.memberId);

  // 관리자 여부
  const isAdmin =
    Number(user?.memberTypeId) === 3 ||
    Number(user?.memberTypeId) === 4;

  // 관리자 문의에만 만족도 기능 사용
  const canUseSatisfaction =
    !isMeetup;

  // 만족도 등록/수정 - 관리자 문의의 문의 작성자만 가능
  const canEvaluateSatisfaction =
    canUseSatisfaction &&
    isQuestionWriter;

  // 만족도 삭제 - 문의 작성자 또는 관리자 가능
  const canDeleteSatisfaction =
    canUseSatisfaction &&
    (
      isQuestionWriter ||
      isAdmin
    );

  // 기존 만족도 평가가 있으면 화면에 표시
  useEffect(() => {
    if (answer.rating) {
      setSelectedRating(answer.rating);
    } else {
      setSelectedRating(null);
    }

    if (answer.feedback) {
      setSatisfactionComment(answer.feedback);
    } else {
      setSatisfactionComment('');
    }
  }, [answer.rating, answer.feedback]);
  
  const createdAt = qna?.createdAt
  ? new Date(qna.createdAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  : '-';

  const answerCreatedAt = answer.createdAt
    ? new Date(answer.createdAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '-';

  const handleDelete = () => {
    if (!questionId) return;
    if (!window.confirm('문의를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    dispatch(
      qnaDeleteRequest(Number(questionId))
    );
  };

  const handleAnswerDelete = () => {
    if (!qna?.questionId || !answer.answerId) return;
    if (!window.confirm('답변을 삭제하시겠습니까?')) return;
    setIsAnswerDeleting(true);
    dispatch(
      qnaAnswerDeleteRequest({
        questionId: Number(qna.questionId),
        answerId: Number(answer.answerId),
      })
    );
  };

  const handleSatisfaction = () => {
    if (!answer.answerId) return;
    if (!selectedRating) {alert('만족도를 선택해주세요.'); return;}

    if (answer.rating) {if (!window.confirm('이미 만족도 평가를 하셨습니다. 수정하시겠습니까?')) {return;}}
      else {if (!window.confirm('만족도를 평가하시겠습니까?')) return; }
    dispatch(
      qnaSatisfactionRequest({
        answerId: Number(answer.answerId),
        data: {
          rating: selectedRating,
          feedback: satisfactionComment,
        },
      })
    );

  };

  const handleSatisfactionDelete = () => {
    if (!answer.answerId) return;
    if (!window.confirm('정말 만족도 평가를 삭제하시겠습니까?')) {return;}

    dispatch(
      qnaSatisfactionDeleteRequest(
        Number(answer.answerId)
      )
    );
    
  };

  return (
    <div className="qna-write-page">
      <div className="qna-write-header">

        <Title level={2} className="qna-write-title">
          {title}
        </Title>

        <Text type="secondary">
          문의 내용을 확인할 수 있습니다.
        </Text>

      </div>

        <div className="qna-write-actions">
          <Space>

              {status === 'PENDING' && canAnswer && (
                <Button
                  type="primary"
                  onClick={() =>
                    router.push(
                      `/user/qna/answerWrite?questionId=${qna?.questionId}`
                    )
                  }
                >
                  답변 등록
                </Button>
              )}
            
            <Button
              onClick={() => {
                if (qna?.answer) {
                  alert('답변이 등록되어 문의 내용을 수정할 수 없습니다.');
                  return;
                }

                router.push(
                  `/user/qna/questionEdit?questionId=${qna?.questionId}`
                );
              }}
            >
              수정
            </Button>

            <Button
              danger
              onClick={handleDelete}
            >
              삭제
            </Button>

          </Space>
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

          <Descriptions.Item label="문의 상태">
            <Tag color={statusColor}>
              {statusText}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="비공개 여부">
            {publicText}
          </Descriptions.Item>

        </Descriptions>

        <Divider />

        <Title level={5}>
          문의 내용
        </Title>

        <Card
          size="small"
          className="qna-detail-content"
        >
          <Paragraph
            style={{
              whiteSpace: 'pre-wrap',
              marginBottom: 0,
              minHeight: 180,
            }}
          >
            {qna?.content || '-'}
          </Paragraph>
        </Card>

        {/* =================================================
            첨부파일
        ================================================= */}
        {qna?.images && qna.images.length > 0 && (
          <>
            <Divider />

            <Title level={5}>
              첨부파일
            </Title>

            <div style={{ marginTop: 12 }}>
              {qna.images.map((image) => (
                <div
                  key={image.imageId}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #eee',
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  📎{' '}
                  <a
                    href={`http://localhost:8080${image.imagePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {image.originalName}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

      </Card>

      <Card
        className="qna-write-card"
        style={{ marginTop: 16 }}
      >

        <Title level={4}>
          답변 정보
        </Title>

        {status === 'ANSWERED' && qna?.answer ? (

          <>

            <Descriptions
              bordered
              column={1}
              size="middle"
            >

              <Descriptions.Item label="답변자">
                {answer.nickname || answer.memberId || '-'}
              </Descriptions.Item>

              <Descriptions.Item label="답변 등록일">
                {answerCreatedAt}
              </Descriptions.Item>

            </Descriptions>

            <Divider />

            <Title level={5}>
              답변 내용
            </Title>

            <Card
              size="small"
              className="qna-detail-content"
            >
              <Paragraph
                style={{
                  whiteSpace: 'pre-wrap',
                  marginBottom: 0,
                  minHeight: 150,
                }}
              >
                {answer.content || '-'}
              </Paragraph>
            </Card>

            <div className="qna-write-actions">
              <Space>

                {canAnswer && (
                  <Button
                    type="primary"
                    onClick={() =>
                      router.push(
                        `/user/qna/answerEdit?answerId=${answer.answerId}&questionId=${qna?.questionId}`
                      )
                    }
                  >
                    답변 수정
                  </Button>
                )}

                {canAnswer && (
                  <Button
                    danger
                    onClick={handleAnswerDelete}
                  >
                    답변 삭제
                  </Button>
                )}

              </Space>
            </div>

            {/* =================================================
                만족도 평가는 관리자 문의에만 표시
            ================================================= */}
            {canUseSatisfaction && (

              <>

                <Divider />

                <Title level={5}>
                  답변 만족도
                </Title>

                {/* =================================================
                    등록된 만족도 결과
                ================================================= */}
                {answer.rating ? (

                  <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    style={{ marginTop: 16 }}
                  >

                    <Descriptions.Item label="만족도">
                      <Rate disabled value={answer.rating} />
                      <Text style={{ marginLeft: 8 }}>
                        {answer.rating}점 / 5점
                      </Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="의견">
                      {answer.feedback || '작성된 의견이 없습니다.'}
                    </Descriptions.Item>

                  </Descriptions>
                ) : (
                  <Text type="secondary">
                    아직 등록된 만족도 평가가 없습니다.
                  </Text>
                )}


                {/* =================================================
                    만족도 등록/수정 - 문의 작성자만
                ================================================= */}
                {canEvaluateSatisfaction && (

                  <>

                    <Divider />

                    <Text type="secondary">
                      답변이 도움이 되었나요?
                    </Text>

                    <div style={{ marginTop: 12 }}>
                      <Rate
                        value={selectedRating}
                        onChange={setSelectedRating}
                      />

                      {selectedRating && (
                        <Text style={{ marginLeft: 8 }}>
                          {selectedRating}점 / 5점
                        </Text>
                      )}
                    </div>

                    <div style={{ marginTop: 20 }}>

                      <Text strong>
                        의견 남기기
                      </Text>

                      <Input
                        value={satisfactionComment}
                        onChange={(e) =>
                          setSatisfactionComment(e.target.value)
                        }
                        maxLength={100}
                        showCount
                        placeholder="답변에 대한 의견을 남겨주세요. (선택)"
                        style={{ marginTop: 8 }}
                      />

                    </div>

                    <div style={{ marginTop: 16 }}>
                      <Space>

                        <Button
                          type="primary"
                          onClick={handleSatisfaction}
                        >
                          {answer.rating
                            ? '만족도 수정'
                            : '만족도 등록'}
                        </Button>


                        {/* 문의 작성자 삭제 가능 */}
                        {answer.rating && (

                          <Button
                            danger
                            onClick={handleSatisfactionDelete}
                          >
                            만족도 삭제
                          </Button>
                        )}
                      </Space>
                    </div>
                  </>
                )}

                {/* =================================================
                    관리자 삭제 버튼
                ================================================= */}
                {!canEvaluateSatisfaction &&
                  answer.rating &&
                  canDeleteSatisfaction && (

                  <div style={{ marginTop: 16 }}>

                    <Button
                      danger
                      onClick={handleSatisfactionDelete}
                    >
                      만족도 삭제
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Text type="secondary">
              아직 등록된 답변이 없습니다.
            </Text>
          </>
        )}
      </Card>

      {isMeetup && (
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 30 }}>
          <Button onClick={() => router.push(`/user/mypage/question`)}
          >
            목록으로
          </Button>
        </div>
      )}

    </div>
  );
}

export default questionDetail;
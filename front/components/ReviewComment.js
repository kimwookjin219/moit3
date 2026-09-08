import React, { useState, useEffect } from 'react';
import { Button, Input, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getCommentsRequest, 
  createCommentRequest, 
  deleteCommentRequest, 
  updateCommentRequest // 👈 1. 액션 임포트 추가
} from '../reducers/reviewReducer';

export default function ReviewComments({ reviewId }) {
  console.log("현재 전달받은 reviewId:", reviewId);
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [localLoading, setLocalLoading] = useState(true);

  // 💡 2. 댓글 수정 상태 관리용 state 추가
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  // 1. 마운트 시 데이터 요청
  useEffect(() => {
    console.log("🚀 [댓글 컴포넌트 마운트됨] reviewId:", reviewId);
    if (reviewId !== undefined && reviewId !== null && reviewId !== '') {
      setLocalLoading(true);
      dispatch(getCommentsRequest({ reviewId }));
    }
  }, [dispatch, reviewId]);

  // 2. Redux에서 해당 리뷰의 댓글만 안전하게 추출
  const { comments, commentError } = useSelector((state) => {
    const reviewState = state.review || state.reviewReducer || {};
    const safeId = Number(reviewId);
    const strId = String(reviewId);

    const targetComments = 
      reviewState.commentsMap?.[reviewId] || 
      reviewState.commentsMap?.[safeId] || 
      reviewState.commentsMap?.[strId] || [];

      // 👉 여기에 콘솔 추가!
    console.log("🔍 [댓글 데이터 확인]", {
      전달받은reviewId: reviewId,
      스토어의commentsMap전체: reviewState.commentsMap,
      최종추출된댓글목록: targetComments
    });

    return {
      comments: targetComments,
      commentError: reviewState.commentError,
    };
  });

  useEffect(() => {
    if (comments) {
      setLocalLoading(false);
    }
  }, [comments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reviewId]);

  useEffect(() => {
    if (commentError) {
      alert(commentError);
    }
  }, [commentError]);

  const handleCommentSubmit = (parentCommentId = null) => {
    const content = parentCommentId ? replyText : commentText;
    if (!content || !content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    dispatch(
      createCommentRequest({
        reviewId,
        content: content.trim(),
        parentCommentId,
      })
    );

    if (parentCommentId) {
      setReplyText('');
      setReplyTo(null);
    } else {
      setCommentText('');
    }

    setTimeout(() => {
      dispatch(getCommentsRequest({ reviewId })); // 객체 형태로 통일
    }, 200);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      dispatch(
        deleteCommentRequest({
          commentId,
          reviewId,
        })
      );
    }
  };

  // 💡 3. 댓글 수정 핸들러 추가
  const handleUpdateComment = (commentId) => {
    console.log("수정 버튼 클릭됨!", commentId);
    if (!editText || !editText.trim()) {
      alert('수정할 내용을 입력해주세요.');
      return;
    }

    dispatch(
      updateCommentRequest({
        commentId,
        content: editText.trim(),
        reviewId, // 사가에서 재조회할 때 사용됨
      })
    );

    // 수정 모드 초기화
    setEditingCommentId(null);
    setEditText('');
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 12 }}>💬 댓글</div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: 16 }}>
        <Input
          placeholder="따뜻한 댓글을 남겨주세요"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onPressEnter={() => handleCommentSubmit(null)}
        />
        <Button type="primary" onClick={() => handleCommentSubmit(null)}>
          등록
        </Button>
      </div>

      {localLoading ? (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Spin size="small" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments && comments.length > 0 ? (
            comments.map((comment) => {
              const commentId = comment.id || comment.commentId;
              const isEditing = editingCommentId === commentId;

              return (
                <div
                  key={commentId}
                  style={{
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                      {comment.memberNickname || comment.nickname || comment.member?.nickname || '익명'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                        {comment.createdAt ? String(comment.createdAt).substring(0, 10) : ''}
                      </span>
                      
                      {/* 💡 4. 수정 / 삭제 버튼 그룹 */}
                      {!isEditing && (
                        <Button
                          type="text"
                          size="small"
                          style={{ padding: 0, height: 'auto', fontSize: '11px', color: '#595959' }}
                          onClick={() => {
                            setEditingCommentId(commentId);
                            setEditText(comment.content); // 기존 내용 채워주기
                          }}
                        >
                          수정
                        </Button>
                      )}

                      <Button
                        type="text"
                        danger
                        size="small"
                        style={{ padding: 0, height: 'auto', fontSize: '11px' }}
                        onClick={() => handleDeleteComment(commentId)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>

                  {/* 💡 5. 수정 중일 때와 아닐 때의 화면 분기 */}
                  {isEditing ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: '8px' }}>
                      <Input
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onPressEnter={() => handleUpdateComment(commentId)}
                      />
                      <Button size="small" type="primary" onClick={() => handleUpdateComment(commentId)}>
                        저장
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div style={{ margin: '4px 0', fontSize: '13px', wordBreak: 'break-all' }}>
                      {comment.content}
                    </div>
                  )}

                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                    onClick={() => setReplyTo(replyTo === commentId ? null : commentId)}
                  >
                    답글쓰기
                  </Button>

                  {replyTo === commentId && (
                    <div style={{ marginTop: 8, display: 'flex', gap: '8px' }}>
                      <Input
                        size="small"
                        placeholder="답글을 남겨주세요"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onPressEnter={() => handleCommentSubmit(commentId)}
                      />
                      <Button size="small" type="primary" onClick={() => handleCommentSubmit(commentId)}>
                        등록
                      </Button>
                    </div>
                  )}

                  {comment.children && comment.children.length > 0 && (
                    <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #e8e8e8' }}>
                      {comment.children.map((child) => {
                        const childId = child.id || child.commentId;
                        return (
                          <div key={childId} style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                {child.memberNickname || child.nickname || '익명'}
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                style={{ padding: 0, height: 'auto', fontSize: '10px' }}
                                onClick={() => handleDeleteComment(childId)}
                              >
                                삭제
                              </Button>
                            </div>
                            <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{child.content}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
              등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
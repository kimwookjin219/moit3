package com.moit.review.service;

import java.util.List;

import com.moit.review.dto.ReviewCommentDto.ReviewCommentRequestDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentResponseDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentUpdateRequestDto;

public interface ReviewCommentService {

    // 댓글/대댓글 작성
    public void createComment(Long reviewId, Long memberId, ReviewCommentRequestDto requestDto);

    // 특정 리뷰의 댓글 목록 조회 (계층형)
    public List<ReviewCommentResponseDto> getCommentsByReview(Long reviewId);

    // 댓글 수정
    public void updateComment(Long commentId, Long memberId, ReviewCommentUpdateRequestDto requestDto);

    // 댓글 삭제 (소프트 딜리트: deleteYn = 'Y')
    public void deleteComment(Long commentId, Long memberId);
}
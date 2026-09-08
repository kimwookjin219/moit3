package com.moit.review.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.entity.Member;
import com.moit.member.repository.MemberRepository;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentRequestDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentResponseDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentUpdateRequestDto;
import com.moit.review.entity.Review;
import com.moit.review.entity.ReviewComment;
import com.moit.review.repository.ReviewCommentRepository;
import com.moit.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewCommentServiceImpl implements ReviewCommentService {
	
	private final ReviewCommentRepository commentRepository;
	private final ReviewRepository reviewRepository;
	private final MemberRepository memberRepository;
	

	@Override
	@Transactional
	public void createComment(Long reviewId, Long memberId, ReviewCommentRequestDto requestDto) {
		Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다. ID: " + reviewId));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. ID: " + memberId));

        ReviewComment parentComment = null;
        if (requestDto.getParentCommentId() != null) {
            parentComment = commentRepository.findById(requestDto.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모 댓글입니다. ID: " + requestDto.getParentCommentId()));
            
            if (parentComment.getParent() != null) {
                throw new IllegalArgumentException("대댓글에는 다시 대댓글을 달 수 없습니다.");
            }
        } else {
            // 💡 [수정] 최상위 댓글인 경우, 삭제되지 않은('N') 활성 댓글이 이미 있는지 체크!
            boolean alreadyExists = commentRepository.existsByReviewIdAndMemberIdAndParentIsNullAndDeleteYn(reviewId, memberId, 'N');
            if (alreadyExists) {
                throw new IllegalArgumentException("이미 이 리뷰에 작성한 댓글이 존재합니다.");
            }
        }

        ReviewComment comment = ReviewComment.builder()
                .review(review)
                .member(member)
                .parent(parentComment)
                .content(requestDto.getContent())
                .build();

        commentRepository.save(comment);
	}

	@Override
    public List<ReviewCommentResponseDto> getCommentsByReview(Long reviewId) {
       
        List<ReviewComment> topComments = commentRepository.findByReviewIdAndParentIsNullAndDeleteYnOrderByCreatedAtAsc(reviewId, 'N');

        return topComments.stream()
                .map(ReviewCommentResponseDto::from)
                .collect(Collectors.toList());
    }

	@Override
	@Transactional
	public void updateComment(Long commentId, Long memberId, ReviewCommentUpdateRequestDto requestDto) {
		ReviewComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. ID: " + commentId));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("댓글을 수정할 권한이 없습니다.");
        }

        comment.setContent(requestDto.getContent());
	}

	@Override
	@Transactional
	public void deleteComment(Long commentId, Long memberId) {
		ReviewComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. ID: " + commentId));
                
        if (!comment.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }

        
        comment.setDeleteYn('Y');
	}
}
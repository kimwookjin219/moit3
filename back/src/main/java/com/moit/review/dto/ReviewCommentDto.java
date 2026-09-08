package com.moit.review.dto;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.moit.review.entity.ReviewComment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class ReviewCommentDto {

    /**
     * 1. 댓글 등록 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class ReviewCommentRequestDto {
    	private Long reviewId;
        private Long parentCommentId; 

        @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
        private String content;
    }

    /**
     * 2. 댓글 수정 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class ReviewCommentUpdateRequestDto {
        @NotBlank(message = "수정할 댓글 내용은 필수 입력 항목입니다.")
        private String content;
    }

    /**
     * 3. 댓글 응답 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class ReviewCommentResponseDto {
        private Long commentId;
        private Long reviewId;
        private Long memberId;
        private String memberNickname;
        private String content;
        private Character deleteYn;
        private String createdAt;
        private String updatedAt;
        
        // 대댓글 목록 (계층형 구조)
        private List<ReviewCommentResponseDto> children = new ArrayList<>();

        // Entity -> DTO 변환 메서드
        public static ReviewCommentResponseDto from(ReviewComment comment) {
            ReviewCommentResponseDto response = new ReviewCommentResponseDto();
            
            response.setCommentId(comment.getId());
            response.setDeleteYn(comment.getDeleteYn());
            response.setContent(comment.getContent());
            
            // 💡 삭제된 댓글 처리 (원하시는 경우 "삭제된 댓글입니다." 텍스트 유지 혹은 제거 가능)
            if (comment.getDeleteYn() != null && comment.getDeleteYn() == 'Y') {  
                response.setContent("삭제된 댓글입니다.");
            }

            // 연관관계 안전하게 매핑 (Review)
            try {
                if (comment.getReview() != null) {
                    response.setReviewId(comment.getReview().getId());
                }
            } catch (Exception e) {
                // 지연 로딩 예외 방어
            }

            // 연관관계 안전하게 매핑 (Member)
            try {
                if (comment.getMember() != null) {
                    response.setMemberId(comment.getMember().getId());
                    response.setMemberNickname(comment.getMember().getNickname());
                }
            } catch (Exception e) {
                // 지연 로딩 예외 방어
            }

            // 날짜 포맷팅 
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            if (comment.getCreatedAt() != null) {
                response.setCreatedAt(comment.getCreatedAt().format(formatter));
            }
            if (comment.getUpdatedAt() != null) {
                response.setUpdatedAt(comment.getUpdatedAt().format(formatter));
            }

            // 자식 대댓글 재귀적 변환 매핑 (💡 삭제된('Y') 대댓글은 화면에 아예 안 보이도록 필터링 추가!)
            try {
                if (comment.getChildren() != null && !comment.getChildren().isEmpty()) {
                    List<ReviewCommentResponseDto> childDtos = comment.getChildren().stream()
                            .filter(child -> child.getDeleteYn() == null || child.getDeleteYn() != 'Y') // 삭제되지 않은 자식만 통과!
                            .map(ReviewCommentResponseDto::from)
                            .collect(Collectors.toList());
                    response.setChildren(childDtos);
                }
            } catch (Exception e) {
                response.setChildren(new ArrayList<>());
            }

            return response;
        }
    }
}
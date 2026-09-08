package com.moit.review.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.review.dto.ReviewCommentDto.ReviewCommentRequestDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentResponseDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentUpdateRequestDto;
import com.moit.review.service.ReviewCommentService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Review Comment Api", description = "리뷰 댓글/대댓글 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewCommentController {

    private final ReviewCommentService reviewCommentService;

    // 인증 객체에서 memberId 추출 공통 메서드 (ReviewController 스타일 그대로 적용)
    private Long extractMemberId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            try {
                if (userDetails.getUser() != null) {
                    Long memberId = userDetails.getUser().getMemberId();
                    if (memberId != null) {
                        return memberId;
                    }
                }
            } catch (Exception e) {
                System.out.println("memberId 추출 중 예외 발생: " + e.getMessage());
            }
        }
        
        throw new IllegalArgumentException("로그인 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
    }

    @Operation(summary = "특정 리뷰의 댓글 목록 조회", description = "특정 리뷰에 달린 최상위 댓글과 대댓글 목록을 계층형으로 조회합니다.")
    @GetMapping("/{reviewId}/comments")
    public ResponseEntity<List<ReviewCommentResponseDto>> getCommentsByReview(@PathVariable("reviewId") Long reviewId) {
        List<ReviewCommentResponseDto> comments = reviewCommentService.getCommentsByReview(reviewId);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "댓글 / 대댓글 작성", description = "특정 리뷰에 댓글 또는 대댓글을 작성합니다.")
    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable("reviewId") Long reviewId,
            @Valid @RequestBody ReviewCommentRequestDto requestDto,
            Authentication authentication) {
        try {
            Long memberId = extractMemberId(authentication);
            reviewCommentService.createComment(reviewId, memberId, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body("댓글이 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(summary = "댓글 수정", description = "작성한 댓글 내용을 수정합니다.")
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable("commentId") Long commentId,
            @Valid @RequestBody ReviewCommentUpdateRequestDto requestDto,
            Authentication authentication) {
        try {
            Long memberId = extractMemberId(authentication);
            reviewCommentService.updateComment(commentId, memberId, requestDto);
            return ResponseEntity.ok("댓글이 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(summary = "댓글 삭제", description = "작성한 댓글을 삭제 합니다.")
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable("commentId") Long commentId,
            Authentication authentication) {
        try {
            Long memberId = extractMemberId(authentication);
            reviewCommentService.deleteComment(commentId, memberId);
            return ResponseEntity.ok("댓글이 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}


/*


package com.moit.review.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.review.dto.ReviewCommentDto.ReviewCommentRequestDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentResponseDto;
import com.moit.review.dto.ReviewCommentDto.ReviewCommentUpdateRequestDto;
import com.moit.review.service.ReviewCommentService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Review Comment Api", description = "리뷰 댓글/대댓글 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewCommentController {

    private final ReviewCommentService reviewCommentService;

    // 인증 객체에서 memberId 추출 (불필요한 try-catch 제거)
    private Long extractMemberId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            if (userDetails.getUser() != null && userDetails.getUser().getMemberId() != null) {
                return userDetails.getUser().getMemberId();
            }
        }
        throw new IllegalArgumentException("로그인 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
    }

    @Operation(summary = "특정 리뷰의 댓글 목록 조회", description = "특정 리뷰에 달린 최상위 댓글과 대댓글 목록을 계층형으로 조회합니다.")
    @GetMapping("/{reviewId}/comments")
    public ResponseEntity<List<ReviewCommentResponseDto>> getCommentsByReview(@PathVariable("reviewId") Long reviewId) {
        List<ReviewCommentResponseDto> comments = reviewCommentService.getCommentsByReview(reviewId);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "댓글 / 대댓글 작성", description = "특정 리뷰에 댓글 또는 대댓글을 작성합니다.")
    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<String> createComment(
            @PathVariable("reviewId") Long reviewId,
            @Valid @RequestBody ReviewCommentRequestDto requestDto,
            Authentication authentication) {
        
        Long memberId = extractMemberId(authentication);
        reviewCommentService.createComment(reviewId, memberId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("댓글이 성공적으로 등록되었습니다.");
    }

    @Operation(summary = "댓글 수정", description = "작성한 댓글 내용을 수정합니다.")
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<String> updateComment(
            @PathVariable("commentId") Long commentId,
            @Valid @RequestBody ReviewCommentUpdateRequestDto requestDto,
            Authentication authentication) {
        
        Long memberId = extractMemberId(authentication);
        reviewCommentService.updateComment(commentId, memberId, requestDto);
        return ResponseEntity.ok("댓글이 수정되었습니다.");
    }

    @Operation(summary = "댓글 삭제", description = "작성한 댓글을 삭제 합니다.")
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable("commentId") Long commentId,
            Authentication authentication) {
        
        Long memberId = extractMemberId(authentication);
        reviewCommentService.deleteComment(commentId, memberId);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }
}


 */


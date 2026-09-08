package com.moit.review.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.moit.review.dto.ReviewDto.ReviewListResponseDto;
import com.moit.review.dto.ReviewDto.ReviewRequestDto;
import com.moit.review.dto.ReviewDto.ReviewResponseDto;

public interface ReviewService {

    // 리뷰 작성
    public void create(ReviewRequestDto requestDto, Long memberId);

    // 리뷰 상세 (ReviewResponseDto 반환)
    public ReviewResponseDto detail(Long reviewId);

    // 리뷰 수정
    public void update(ReviewRequestDto requestDto, Long memberId, Long reviewId);

    // 리뷰 삭제 (사용자 논리 삭제)
    public void delete(Long reviewId, Long memberId);

    // 특정 모임의 리뷰 목록 조회 (페이징)
    public ReviewListResponseDto getReviewsByMeetup(Long meetupId, Pageable pageable);
    
    //로그인한 회원의 좋아요 상태를 반영하기 위한 메서드 오버로딩
    public ReviewListResponseDto getReviewsByMeetup(Long meetupId, Pageable pageable, Long memberId);
    
    // 특정 모임의 리뷰 목록 조회 (검색어 + 페이징) - 모임 상세페이지용
    public ReviewListResponseDto getReviewsByMeetup(Long meetupId, String keyword, Pageable pageable);
    
    //검색어와 로그인 회원 ID를 함께 받는 메서드 오버로딩
    public ReviewListResponseDto getReviewsByMeetup(Long meetupId, String keyword, Pageable pageable, Long memberId);

    // 특정 회원이 작성한 리뷰 목록 조회 (마이페이지용 페이징 + 검색)
    public ReviewListResponseDto getMyReviews(Long memberId, String keyword, Pageable pageable);

    // 리뷰 좋아요 토글 (좋아요 / 취소)
    //public void reviewLike(Long memberId, Long reviewId);
    public ReviewResponseDto reviewLike(Long memberId, Long reviewId);

    // AI 리뷰 요약/분석
    public String reviewAnalysis(Long meetupId);
    
    // 리뷰 이미지
    public List<Long> uploadImages(List<MultipartFile> images, Long memberId);

    // -------------------------------------------------------------------
    // 관리자단

    // 관리자 - 전체 리뷰 목록 조회 및 검색 (status 파라미터 포함된 버전으로 단일화)
    public ReviewListResponseDto getAdminReviewList(String keyword, String status, Pageable pageable);

    // 관리자 - 리뷰 숨김/공개 상태 변경 (isPublic 변경)
    public void changeReviewVisibility(Long reviewId);

    // 관리자 - 리뷰 논리 삭제 처리
    public void adminDelete(Long reviewId);
}
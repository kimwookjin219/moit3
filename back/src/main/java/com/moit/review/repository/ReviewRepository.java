package com.moit.review.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.review.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 1. 특정 모임의 리뷰 목록 조회 (최신순)
    List<Review> findByMeetup_IdAndDeleteYnAndIsPublicOrderByIdDesc(Long meetupId, Character deleteYn, String isPublic);

    // 2. 특정 모임의 리뷰 목록 조회 (좋아요순)
    List<Review> findByMeetup_IdAndDeleteYnAndIsPublicOrderByLikesCountDescIdDesc(Long meetupId, Character deleteYn, String isPublic);

    // 3. [마이페이지] 내가 쓴 리뷰 목록 조회 (키워드 검색 + Pageable 정렬 적용)
    @Query("SELECT r FROM Review r WHERE r.member.id = :memberId " +
           "AND r.deleteYn = 'N' " +
           "AND (:keyword IS NULL OR :keyword = '' OR r.content LIKE %:keyword%)")
    Page<Review> selectReviewByMemberId(
        @Param("memberId") Long memberId, 
        @Param("keyword") String keyword, 
        Pageable pageable
    );

    // 4. 공개 리뷰 내용 검색 (사용자용)
    List<Review> findByContentContainingAndDeleteYnAndIsPublicOrderByIdDesc(String keyword, Character deleteYn, String isPublic);

    // 5. [관리자] 리뷰 내용으로 전체 검색 (삭제되지 않은 건)
    List<Review> findByContentContainingAndDeleteYnOrderByIdDesc(String keyword, Character deleteYn);

    // 6. [관리자] 특정 작성자 리뷰 검색
    List<Review> findByMember_IdAndDeleteYnOrderByIdDesc(Long memberId, Character deleteYn);

 // 7. [관리자] 전체 목록 검색 및 페이징
    @Query("SELECT r FROM Review r WHERE r.deleteYn = 'N' " +
           "AND (:keyword IS NULL OR :keyword = '' OR r.content LIKE %:keyword%) " +
           "AND (:status IS NULL OR :status = '' OR :status = 'all' OR r.isPublic = :status)")
    Page<Review> adminGetReviewList(
        @Param("keyword") String keyword,                         
        @Param("status") String status,
        Pageable pageable
    );

    // 8. 좋아요 수 +1
    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query("UPDATE Review r SET r.likesCount = r.likesCount + 1 WHERE r.id = :reviewId")
    int incrementLikesCount(@Param("reviewId") Long reviewId);

    // 9. 좋아요 수 -1
    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query("UPDATE Review r SET r.likesCount = r.likesCount - 1 WHERE r.id = :reviewId")
    int decrementLikesCount(@Param("reviewId") Long reviewId);
    
    // 특정 모임의 공개된 리뷰 목록 조회 (페이징 + 정렬 적용)
    Page<Review> findByMeetup_IdAndDeleteYnAndIsPublic(Long meetupId, Character deleteYn, String isPublic, Pageable pageable);

    // 모임 상세 페이지용 리뷰 목록 조회 (검색어 + 페이징 + 정렬 적용)
    @Query("SELECT r FROM Review r WHERE r.meetup.id = :meetupId " +
           "AND r.deleteYn = 'N' " +
           "AND r.isPublic = 'Y' " +
           "AND (:keyword IS NULL OR :keyword = '' OR r.content LIKE %:keyword%)")
    Page<Review> selectReviewByMeetupId(
        @Param("meetupId") Long meetupId, 
        @Param("keyword") String keyword, 
        Pageable pageable
    );

    boolean existsByMeetup_IdAndMember_IdAndDeleteYn(Long meetupId, Long memberId, Character deleteYn);
}
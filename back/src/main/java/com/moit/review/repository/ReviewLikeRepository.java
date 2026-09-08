package com.moit.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.review.entity.ReviewLike;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    
    // 1. 좋아요 존재 여부 확인
    boolean existsByReview_IdAndMember_Id(Long reviewId, Long memberId);
    
    // 2. 좋아요 데이터 단건 조회
    Optional<ReviewLike> findByReview_IdAndMember_Id(Long reviewId, Long memberId);
    
    // 3. 좋아요 삭제 (취소)
    void deleteByReview_IdAndMember_Id(Long reviewId, Long memberId);
}
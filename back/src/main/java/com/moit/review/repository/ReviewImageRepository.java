package com.moit.review.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.review.entity.ReviewImage;



@Repository
public interface ReviewImageRepository extends JpaRepository <ReviewImage,Long> {
	
	// 특정 리뷰에 등록된 이미지 목록 조회
    List<ReviewImage> findByReview_Id(Long reviewId);

    // 특정 리뷰의 모든 이미지 삭제
    void deleteByReview_Id(Long reviewId);
}

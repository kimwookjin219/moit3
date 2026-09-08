//package com.moit.review.dao;
//
//import java.util.List;
//import java.util.Map;
//
//import org.apache.ibatis.annotations.Mapper;
//import org.apache.ibatis.annotations.Param;
//
//import com.moit.review.dto.ReviewDto;
//import com.moit.util.UtilPaging;
//
//@Mapper
//public interface ReviewMapper {
//
//    // ==========================================
//    // 사용자 영역
//    // ==========================================
//    int insertUserReview(ReviewDto.Request dto);
//
//    ReviewDto.Response selectReviewById(Long reviewId);
//
//    List<ReviewDto.Response> selectUserReview(
//            @Param("meetupId") Long meetupId, 
//            @Param("sort") String sort
//    );
//
//    int updateUserReview(ReviewDto.Request dto);
//
//    int deleteUserReview(Long reviewId);
//
//    int updateUserReviewHide(ReviewDto.Request dto);
//
//    // 마이페이지 목록 + 검색
//    List<ReviewDto.Response> selectReviewByMemberId(
//            @Param("memberId") Long memberId,
//            @Param("keyword") String keyword,
//            @Param("sort") String sort
//    );
//
//    // 모임 상세 검색
//    List<ReviewDto.Response> selectReviewByContent(
//            @Param("meetupId") Long meetupId,
//            @Param("keyword") String keyword,
//            @Param("sort") String sort
//    );
//
//    // ==========================================
//    // 이미지 영역
//    // ==========================================
//    int insertImage(ReviewDto.Request dto);
//
//    int insertReviewImage(
//            @Param("reviewId") Long reviewId,
//            @Param("imageId") Long imageId
//    );
//
//    // ==========================================
//    // 좋아요 영역
//    // ==========================================
//    int checkLikeExists(Map<String, Object> params);
//
//    int insertLike(Map<String, Object> params);
//
//    int deleteLike(Map<String, Object> params);
//
//    int incrementLikeCount(Long reviewId);
//
//    int decrementLikeCount(Long reviewId);
//
//    int getLikeCount(Long reviewId);
//
//    // ==========================================
//    // 관리자 영역
//    // ==========================================
//    List<ReviewDto.Response> adminSelectReviewList(Long memberId);
//
//    List<ReviewDto.Response> adminSearchReviewByContent(String keyword);
//
//    List<ReviewDto.Response> adminSearchReviewByWriter(Long memberId);
//
//    int adminHideReview(@Param("reviewId") Long reviewId);
//
//    int adminDeleteReview(@Param("reviewId") Long reviewId);
//
//    // 관리자 페이징 처리
//    List<ReviewDto.Response> adminGetReviewList(
//            @Param("keyword") String keyword,
//            @Param("memberId") Long memberId,
//            @Param("paging") UtilPaging paging,
//            @Param("endRow") int endRow
//    );
//
//    int adminGetReviewCount(
//            @Param("keyword") String keyword, 
//            @Param("memberId") Long memberId
//    );
//}
package com.moit.review.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;

import com.moit.review.entity.Review;
import com.moit.review.entity.ReviewImage;
import com.moit.review.repository.ReviewLikeRepository;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class ReviewDto {

	@Setter
	@Getter
	@NoArgsConstructor
	public static class ReviewRequestDto {
		private Long meetupId;
		private Long memberId;
		private String content;
		private Integer rating;
		private String isPublic;
		private List<Long> imageIds = new ArrayList<>();
	}

	// 리뷰 이미지 응답 DTO
	@Getter
	@Setter
	public static class ReviewImageResponseDto {
		private Long reviewImageId;
		private Long imageId;
		private String imageUrl; // 이미지 경로

		public static ReviewImageResponseDto from(ReviewImage reviewImage) {
			ReviewImageResponseDto response = new ReviewImageResponseDto();
			response.setReviewImageId(reviewImage.getId());
			
			try {
				if (reviewImage.getImage() != null) {
					response.setImageId(reviewImage.getImage().getId());
					response.setImageUrl(reviewImage.getImage().getImagePath());
				}
			} catch (Exception e) {
				// 지연 로딩 실패 시 예외 흡수
			}
			
			return response;
		}
	}

	// 리뷰 응답 DTO
	@Getter
	@Setter
	public static class ReviewResponseDto {
		private Long id;
		private Long meetupId;
		private Long memberId;
		private String memberNickname;
		private String content;
		private Integer rating;
		private Integer likesCount;
		private Integer viewsCount;
		private String isPublic; 
		private String meetupTitle; // 모임제목 
		private Boolean liked; // 좋아요 체크
		private List<ReviewImageResponseDto> images = new ArrayList<>();
		private String createdAt;
		private String updatedAt;

		// 목록 조회용 변환 메서드
		public static ReviewResponseDto listFrom(Review review, Long currentMemberId, ReviewLikeRepository reviewLikeRepository) {
			ReviewResponseDto response = new ReviewResponseDto();
			response.setId(review.getId());
			response.setContent(review.getContent());
			response.setRating(review.getRating());
			response.setLikesCount(review.getLikesCount());
			response.setViewsCount(review.getViewsCount());
			response.setIsPublic(review.getIsPublic()); 
			
		    if (review.getMeetup() != null) {
		        response.setMeetupId(review.getMeetup().getId());
		        response.setMeetupTitle(review.getMeetup().getTitle());
		    }

			if (review.getMember() != null) {
				response.setMemberId(review.getMember().getId());
				response.setMemberNickname(review.getMember().getNickname());
			}
			
			// 좋아요 여부 체크 로직
			if (currentMemberId != null && reviewLikeRepository != null) {
				boolean isLiked = reviewLikeRepository.existsByReview_IdAndMember_Id(review.getId(), currentMemberId);
				response.setLiked(isLiked);
			} else {
				response.setLiked(false);
			}

			// ★ LazyInitializationException 방지용 try-catch
			try {
				if (review.getReviewImages() != null && !review.getReviewImages().isEmpty()) {
					List<ReviewImageResponseDto> imageDtos = new ArrayList<>();
					for (ReviewImage reviewImage : review.getReviewImages()) {
						imageDtos.add(ReviewImageResponseDto.from(reviewImage));
					}
					response.setImages(imageDtos);
				}
			} catch (Exception e) {
				response.setImages(new ArrayList<>());
			}

			return response;
		}

		// 상세 조회용 변환 메서드
		public static ReviewResponseDto detailFrom(Review review, Long currentMemberId, ReviewLikeRepository reviewLikeRepository) {
			ReviewResponseDto response = new ReviewResponseDto();
			response.setId(review.getId());
			response.setContent(review.getContent());
			response.setRating(review.getRating());
			response.setLikesCount(review.getLikesCount());
			response.setViewsCount(review.getViewsCount());
			response.setIsPublic(review.getIsPublic()); 

			if (review.getMeetup() != null) {
				response.setMeetupId(review.getMeetup().getId());
				response.setMeetupTitle(review.getMeetup().getTitle());
			}

			if (review.getMember() != null) {
				response.setMemberId(review.getMember().getId());
				response.setMemberNickname(review.getMember().getNickname());
			}
			
			// 상세 조회에서도 좋아요 여부 세팅
			if (currentMemberId != null && reviewLikeRepository != null) {
				boolean isLiked = reviewLikeRepository.existsByReview_IdAndMember_Id(review.getId(), currentMemberId);
				response.setLiked(isLiked);
			} else {
				response.setLiked(false);
			} // 👈 [수정] 여기에 빠져있던 닫는 중괄호를 추가했습니다!

			try {
				if (review.getReviewImages() != null && !review.getReviewImages().isEmpty()) {
					List<ReviewImageResponseDto> imageDtos = new ArrayList<>();
					for (ReviewImage reviewImage : review.getReviewImages()) {
						imageDtos.add(ReviewImageResponseDto.from(reviewImage));
					}
					response.setImages(imageDtos);
				}
			} catch (Exception e) {
				response.setImages(new ArrayList<>());
			}

			return response;
		}
	}

	@Getter
	@Setter
	public static class ReviewListResponseDto {
		private List<ReviewResponseDto> reviews;
		private Long totalCount;
		private Integer totalPage;

	
		public static ReviewListResponseDto from(Page<Review> reviewPage, Long currentMemberId, ReviewLikeRepository reviewLikeRepository) {
			ReviewListResponseDto response = new ReviewListResponseDto();
			
			List<ReviewResponseDto> dtoList = reviewPage.getContent().stream()
					.map(review -> ReviewResponseDto.listFrom(review, currentMemberId, reviewLikeRepository))
					.collect(Collectors.toList());

			response.setReviews(dtoList);
			response.setTotalCount(reviewPage.getTotalElements());
			response.setTotalPage(reviewPage.getTotalPages());
			
			return response;
		}
	}
}
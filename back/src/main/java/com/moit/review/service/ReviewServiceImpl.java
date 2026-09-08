package com.moit.review.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.moit.common.entity.Image;
import com.moit.common.repository.ImageRepository;
import com.moit.exception.ResourceNotFoundException;
import com.moit.meetup.entity.Meetup;
import com.moit.meetup.enums.MeetupStatus;
import com.moit.meetup.repository.MeetupRepository;
import com.moit.member.entity.Member;
import com.moit.member.repository.MemberRepository;
import com.moit.review.client.ModerationClientService;
import com.moit.review.client.OpenAiReviewService;
import com.moit.review.dto.ReviewDto.ReviewListResponseDto;
import com.moit.review.dto.ReviewDto.ReviewRequestDto;
import com.moit.review.dto.ReviewDto.ReviewResponseDto;
import com.moit.review.entity.Review;
import com.moit.review.entity.ReviewImage;
import com.moit.review.entity.ReviewLike;
import com.moit.review.repository.ReviewImageRepository;
import com.moit.review.repository.ReviewLikeRepository;
import com.moit.review.repository.ReviewRepository;
import com.moit.util.UtilUpload;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

	private final ReviewRepository reviewRepository;
	private final ReviewLikeRepository reviewLikeRepository;
	private final ReviewImageRepository reviewImageRepository;
	private final MeetupRepository meetupRepository;
	private final MemberRepository memberRepository;
	private final ImageRepository imageRepository;
	private final UtilUpload utilUpload; 

	// api 연동
	private final ModerationClientService moderationClientService;
	private final OpenAiReviewService openAiReviewService;

	// 리뷰 작성
	@Override
	@Transactional
	public void create(ReviewRequestDto requestDto, Long memberId) {
		// 1. 모임 상태 체크
		Meetup meetup = meetupRepository.findById(requestDto.getMeetupId())
				.orElseThrow(() -> new ResourceNotFoundException("모임을 찾을 수 없습니다."));
		
		if (meetup.getMeetupStatus() != MeetupStatus.COMPLETED) {
		    throw new IllegalStateException("모임이 완료된 상태에서만 후기를 작성할 수 있습니다.");
		}

		// 2. 중복 작성 체크
		boolean hasWritten = reviewRepository.existsByMeetup_IdAndMember_IdAndDeleteYn(
				requestDto.getMeetupId(), memberId, 'N');
		if (hasWritten) {
			throw new IllegalStateException("이미 이 모임에 작성한 후기가 존재합니다.");
		}

		// 3. 필터링 검사
		if (moderationClientService.checkContent(requestDto.getContent())) {
			throw new IllegalArgumentException("부적절한 내용이 포함되어 있어 등록할 수 없습니다.");
		}

		Member member = memberRepository.getReferenceById(memberId);
		Review review = Review.builder().meetup(meetup).member(member).content(requestDto.getContent())
				.rating(requestDto.getRating())
				.isPublic(requestDto.getIsPublic() != null ? requestDto.getIsPublic() : "Y").viewsCount(0).build();

		Review savedReview = reviewRepository.save(review);

		if (requestDto.getImageIds() != null && !requestDto.getImageIds().isEmpty()) {
			for (Long imageId : requestDto.getImageIds()) {
				Image image = Image.builder().id(imageId).build();
				ReviewImage reviewImage = ReviewImage.builder().review(savedReview).image(image).build();
				reviewImageRepository.save(reviewImage);
			}
		}
	}

	// 리뷰 상세 조회
	@Override
	@Transactional
	public ReviewResponseDto detail(Long reviewId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다. REVIEW ID : " + reviewId));

		if ("N".equals(review.getIsPublic())) {
			throw new IllegalArgumentException("비공개 처리된 리뷰입니다.");
		}

		// review.getViewsCount() NPE 방지
		int currentViews = (review.getViewsCount() != null) ? review.getViewsCount() : 0;
		review.setViewsCount(currentViews + 1);

		
		Long currentMemberId = null; 
		return ReviewResponseDto.detailFrom(review, currentMemberId, reviewLikeRepository);
	}

	// 리뷰 수정
	@Override
	@Transactional
	public void update(ReviewRequestDto requestDto, Long memberId, Long reviewId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다."));

		if (!review.getMember().getId().equals(memberId)) {
			throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
		}

		if (requestDto.getContent() != null && !requestDto.getContent().equals(review.getContent())) {
			if (moderationClientService.checkContent(requestDto.getContent())) {
				throw new IllegalArgumentException("부적절한 내용이 포함되어 있어 수정할 수 없습니다.");
			}
		}

		review.setContent(requestDto.getContent());
		review.setRating(requestDto.getRating());
		if (requestDto.getIsPublic() != null) {
			review.setIsPublic(requestDto.getIsPublic());
		}

		if (requestDto.getImageIds() != null) {
			List<ReviewImage> currentReviewImages = review.getReviewImages();

			List<ReviewImage> imagesToRemove = new ArrayList<>();
			for (ReviewImage ri : currentReviewImages) {
				if (!requestDto.getImageIds().contains(ri.getImage().getId())) {
					imagesToRemove.add(ri);
				}
			}

			for (ReviewImage ri : imagesToRemove) {
				reviewImageRepository.delete(ri);
				currentReviewImages.remove(ri);
			}

			List<Long> existingImageIds = currentReviewImages.stream()
					.map(ri -> ri.getImage().getId())
					.toList();

			for (Long imageId : requestDto.getImageIds()) {
				if (!existingImageIds.contains(imageId)) {
					Image image = Image.builder().id(imageId).build();
					ReviewImage reviewImage = ReviewImage.builder().review(review).image(image).build();
					reviewImageRepository.save(reviewImage);
					currentReviewImages.add(reviewImage);
				}
			}
		}
	}

	// 리뷰 삭제
	@Override
	@Transactional
	public void delete(Long reviewId, Long memberId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다. REVIEW ID : " + reviewId));

		if (!review.getMember().getId().equals(memberId)) {
			throw new IllegalArgumentException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
		}

		review.setDeleteYn('Y');
	}

	// -------------------------------------------------------------------------
	// 모임별 리뷰 목록 조회 (인터페이스 선언부 순서 및 타입에 맞춘 구현)
	// -------------------------------------------------------------------------

	@Override
	public ReviewListResponseDto getReviewsByMeetup(Long meetupId, Pageable pageable) {
		return getReviewsByMeetup(meetupId, pageable, null);
	}

	@Override
	public ReviewListResponseDto getReviewsByMeetup(Long meetupId, Pageable pageable, Long memberId) {
		return getReviewsByMeetup(meetupId, null, pageable, memberId);
	}

	@Override
	public ReviewListResponseDto getReviewsByMeetup(Long meetupId, String keyword, Pageable pageable) {
		return getReviewsByMeetup(meetupId, keyword, pageable, null);
	}

	@Override
	public ReviewListResponseDto getReviewsByMeetup(Long meetupId, String keyword, Pageable pageable, Long memberId) {
		Page<Review> reviewPage = reviewRepository.selectReviewByMeetupId(meetupId, keyword, pageable);

		reviewPage.getContent().forEach(review -> {
			if (review.getReviewImages() != null) {
				review.getReviewImages().forEach(ri -> {
					if (ri.getImage() != null) {
						ri.getImage().getId(); 
					}
				});
			}
		});

		// 전달받은 memberId를 넘겨주어 로그인한 유저의 좋아요 상태(liked)를 정확히 판별
		List<ReviewResponseDto> dtoList = reviewPage.getContent().stream()
				.map(review -> ReviewResponseDto.listFrom(review, memberId, reviewLikeRepository))
				.collect(Collectors.toList());

		ReviewListResponseDto response = new ReviewListResponseDto();
		response.setReviews(dtoList);
		response.setTotalCount(reviewPage.getTotalElements());
		response.setTotalPage(reviewPage.getTotalPages());

		return response;
	}

	// -------------------------------------------------------------------------

	// 내가 작성한 리뷰 목록 조회 (검색 + 정렬 + 페이징 적용)
	@Override
	public ReviewListResponseDto getMyReviews(Long memberId, String keyword, Pageable pageable) {
		Page<Review> page = reviewRepository.selectReviewByMemberId(memberId, keyword, pageable);

		page.getContent().forEach(review -> {
			if (review.getReviewImages() != null) {
				review.getReviewImages().forEach(ri -> {
					if (ri.getImage() != null) {
						ri.getImage().getId(); // 지연 로딩 강제 초기화
					}
				});
			}
		});

		List<ReviewResponseDto> dtoList = page.getContent().stream()
				.map(review -> ReviewResponseDto.listFrom(review, memberId, reviewLikeRepository))
				.collect(Collectors.toList());

		ReviewListResponseDto response = new ReviewListResponseDto();
		response.setReviews(dtoList);
		response.setTotalCount(page.getTotalElements());
		response.setTotalPage(page.getTotalPages());

		return response;
	}

	// 리뷰 좋아요 (등록 / 취소 토글)
	@Override
	@Transactional
	public ReviewResponseDto reviewLike(Long memberId, Long reviewId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다. REVIEW ID : " + reviewId));
				
		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다. MEMBER ID : " + memberId));

		boolean exists = reviewLikeRepository.existsByReview_IdAndMember_Id(reviewId, memberId);

		if (exists) {
			reviewLikeRepository.deleteByReview_IdAndMember_Id(reviewId, memberId);
			
			int currentLikes = (review.getLikesCount() != null) ? review.getLikesCount() : 0;
			review.setLikesCount(Math.max(0, currentLikes - 1));
		} else {
			ReviewLike reviewLike = ReviewLike.builder().review(review).member(member).build();
			reviewLikeRepository.save(reviewLike);
			
			int currentLikes = (review.getLikesCount() != null) ? review.getLikesCount() : 0;
			review.setLikesCount(currentLikes + 1);
		}
		
		return ReviewResponseDto.listFrom(review, memberId, reviewLikeRepository);
	}

	// AI 리뷰 분석
	@Override
	public String reviewAnalysis(Long meetupId) {
		List<Review> reviewList = reviewRepository.findByMeetup_IdAndDeleteYnAndIsPublicOrderByIdDesc(meetupId, 'N', "Y");

		System.out.println("===== 🤖 AI 분석용 조회된 후기 개수: " + reviewList.size() + " =====");
		for (Review r : reviewList) {
			System.out.println("- 후기 내용: " + r.getContent());
		}

		if (reviewList.isEmpty()) {
			return "분석할 수 있는 공개된 후기가 없습니다.";
		}

		List<ReviewResponseDto> dtoList = reviewList.stream()
				.map(review -> ReviewResponseDto.listFrom(review, null, reviewLikeRepository))
				.collect(Collectors.toList());
		
		return openAiReviewService.reviewAnalysis(dtoList);
	}

	// 관리자 - 전체 리뷰 목록 조회
	@Override
    public ReviewListResponseDto getAdminReviewList(String keyword, String status, Pageable pageable) {
        Page<Review> page = reviewRepository.adminGetReviewList(keyword, status, pageable);

        page.getContent().forEach(review -> {
            if (review.getReviewImages() != null) {
                review.getReviewImages().forEach(ri -> {
                    if (ri.getImage() != null) {
                        ri.getImage().getId();
                    }
                });
            }
        });

        List<ReviewResponseDto> dtoList = page.getContent().stream()
                .map(review -> ReviewResponseDto.listFrom(review, null, reviewLikeRepository))
                .collect(Collectors.toList());

        ReviewListResponseDto response = new ReviewListResponseDto();
        response.setReviews(dtoList);
        response.setTotalCount(page.getTotalElements());
        response.setTotalPage(page.getTotalPages());

        return response;
    }

	// 관리자 - 공개 여부 변경
	@Override
	@Transactional
	public void changeReviewVisibility(Long reviewId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다. REVIEW ID : " + reviewId));

		review.setIsPublic("Y".equals(review.getIsPublic()) ? "N" : "Y");
	}

	// 관리자 - 강제 삭제 (논리 삭제)
	@Override
	@Transactional
	public void adminDelete(Long reviewId) {
		Review review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다. REVIEW ID : " + reviewId));

		review.setDeleteYn('Y');
	}

	@Override
	@Transactional
	public List<Long> uploadImages(List<MultipartFile> images, Long memberId) {
		List<Long> imageIds = new ArrayList<>();
		
		if (images == null || images.isEmpty()) {
			return imageIds;
		}
		//이미지 5개 초과 체크
		if (images.size() > 5) {
				throw new IllegalArgumentException("이미지는 최대 5개까지만 업로드할 수 있습니다.");
		}

		try {
			for (MultipartFile file : images) {
				if (file.isEmpty()) continue;
				
				String savedFileName = utilUpload.fileUpload(file, "review");
				
				Image image = Image.builder()
						.imagePath(savedFileName)
						.build();
				
				Image savedImage = imageRepository.save(image);
				imageIds.add(savedImage.getId());
			}
		} catch (IOException e) {
			throw new RuntimeException("리뷰 이미지 업로드 중 오류가 발생했습니다.", e);
		}

		return imageIds;
	}
}
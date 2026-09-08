package com.moit.review.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.review.dto.ReviewNotificationResponseDto;
import com.moit.review.entity.ReviewNotification;
import com.moit.review.repository.ReviewNotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly=true)
public class ReviewNotificationServiceImpl implements ReviewNotificationService {
	
	private final ReviewNotificationRepository notificationRepository;
	
	@Override
	public List<ReviewNotificationResponseDto> getMyNotifications(Long memberId) {
		
		List<ReviewNotification> notifications = notificationRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
				
		
		return notifications.stream()
				.filter(n -> !"Y".equals(n.getIsRead()))
				.map(ReviewNotificationResponseDto::from)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional 
	public void markAsRead(Long notificationId) {
		// 1. 알림 존재 여부 확인 및 조회
		ReviewNotification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알림입니다. ID: " + notificationId));
		
		if ("Y".equals(notification.getIsRead())) {
			return; 
		}

		notification.setIsRead("Y");
	}

	@Override
	public void completeReviewNotification(Long memberId, Long meetupId) {
		notificationRepository.findByMemberIdAndMeetupId(memberId, meetupId).ifPresent(notification -> {
	        notification.setIsRead("Y"); // 읽음 처리
	       
	    });
		
	}

}
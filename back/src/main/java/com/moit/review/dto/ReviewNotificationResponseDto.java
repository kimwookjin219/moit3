package com.moit.review.dto;

import java.time.LocalDateTime;

import com.moit.review.entity.ReviewNotification;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewNotificationResponseDto {
	
	private Long id;
	private Long meetupId;
	private String content;
	private String isRead;
	private LocalDateTime createdAt;
	
	public static ReviewNotificationResponseDto from(ReviewNotification notification) {
		return ReviewNotificationResponseDto.builder()
				.id(notification.getId())
				.meetupId(notification.getMeetup().getId())
				.content(notification.getContent())
				.isRead(notification.getIsRead())
				.createdAt(notification.getCreatedAt())
				.build();
	}
	
}

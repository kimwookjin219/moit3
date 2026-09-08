package com.moit.review.service;

import java.util.List;
import com.moit.review.dto.ReviewNotificationResponseDto;

public interface ReviewNotificationService {

    // 내 알림 목록 조회
    public List<ReviewNotificationResponseDto> getMyNotifications(Long memberId);

    // 알림 읽음 처리
    public void markAsRead(Long notificationId);
    
    public void completeReviewNotification(Long memberId, Long meetupId);
}
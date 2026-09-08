package com.moit.review.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.review.dto.ReviewNotificationResponseDto;
import com.moit.review.service.ReviewNotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications/reviews")
public class ReviewNotificationController {
	
	private final ReviewNotificationService notificationService;
	
	@GetMapping
	public ResponseEntity<List<ReviewNotificationResponseDto>> getMyNotifications(@RequestParam("memberId") Long memberId) {
        List<ReviewNotificationResponseDto> response = notificationService.getMyNotifications(memberId);
        return ResponseEntity.ok(response);
    }
	
	// 2. 알림 읽음 처리   
    @PatchMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable("id") Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok("알림이 읽음 처리되었습니다.");
    }

}

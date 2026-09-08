package com.moit.qna.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.qna.dto.NotificationDto;
import com.moit.qna.service.NotificationService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Notification Api", description = "알림 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    // 전체 알림 목록
    @Operation( summary = "알림 목록 조회", description = "로그인한 사용자의 전체 알림 목록을 조회합니다." )
    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(@AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        return ResponseEntity.ok(notificationService.selectAll(memberId));
    }

    // 읽지 않은 알림 목록
    @Operation( summary = "읽지 않은 알림 목록 조회", description = "로그인한 사용자의 읽지 않은 알림 목록을 조회합니다.")
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> unread(@AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        return ResponseEntity.ok(notificationService.selectUnread(memberId));
    }

    // 읽지 않은 알림 개수
    @Operation( summary = "읽지 않은 알림 개수 조회", description = "로그인한 사용자의 읽지 않은 알림 개수를 조회합니다." )
    @GetMapping("/count")
    public ResponseEntity<Integer> count(@AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        return ResponseEntity.ok(notificationService.unreadCount(memberId));
    }

    // 알림 읽음 처리
    @Operation( summary = "알림 읽음 처리", description = "특정 알림을 읽음 상태로 변경합니다." )
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> read(
            @PathVariable("notificationId") Long notificationId,
            @AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        notificationService.readNotification(notificationId, memberId);
        return ResponseEntity.noContent().build();
    }
    
    // 전체 알림 읽음 처리
    @Operation( summary = "전체 알림 읽음 처리", description = "전체 알림을 읽음 상태로 변경합니다." )
    @PatchMapping("/read-all")
    public ResponseEntity<Void> readAll(
            @AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        notificationService.readAllNotifications(memberId);
        return ResponseEntity.noContent().build();
    }
    
    @Operation( summary = "삭제하고 싶은 알림 삭제", description = "삭제하고 싶은 알림을 삭제합니다." )
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> delete(
    		@PathVariable("notificationId") Long notificationId,
            @AuthenticationPrincipal CustomUserDetails loginUser) {
        Long memberId = loginUser.getUser().getMemberId();
        notificationService.deleteNotification(
            notificationId,
            memberId
        );
        return ResponseEntity.noContent().build();
    }
}
package com.moit.qna.dto;

import lombok.Data;

@Data
public class NotificationDto {
    private Long notificationId;
    private Long questionId;
    private Long memberId;
    private String type;
    private String message;
    private String isRead;
    private java.sql.Timestamp createdAt;
}

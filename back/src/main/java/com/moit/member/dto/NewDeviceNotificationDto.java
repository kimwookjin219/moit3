package com.moit.member.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewDeviceNotificationDto {

    private Long notificationId;
    private Long memberId;
    private String message;

}
package com.moit.member.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginDeviceDto {
	
	// 기기 식별자
    private String deviceId;

    // 기기 이름
    private String deviceName;

    // IP 주소
    private String ipAddress;

    // 브라우저 / OS 정보
    private String userAgent;

    // 로그인 방식
    // NORMAL / KAKAO / NAVER / GOOGLE
    private String loginType;

    // 마지막 로그인 시간
    private LocalDateTime lastLoginAt;

    // 현재 사용 중인 기기인지
    private boolean current;
}

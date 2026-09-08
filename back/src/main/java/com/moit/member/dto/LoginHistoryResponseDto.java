package com.moit.member.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginHistoryResponseDto {
	
	// 로그인 기록 ID
	private Long loginHistoryId;
	
	// 로그인 일시
	private LocalDateTime loginAt;
	
	// IP 주소
	private String ipAddress;
	
	// 접속 환경
	private String userAgent;
	
	// 로그인 방식
	private String loginType;
}

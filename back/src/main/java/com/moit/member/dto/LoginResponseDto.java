package com.moit.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginResponseDto {
	
	private String accessToken;	
	private String refreshToken;
	
	private Long memberId;
	private String loginId;	
	private Long memberTypeId;
	
	private String deviceId;
}

package com.moit.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RefreshResponseDto {
	
	private String accessToken;
	//private String refreshToken;
	
	public RefreshResponseDto(String accessToken) {
        this.accessToken = accessToken;
    }
}

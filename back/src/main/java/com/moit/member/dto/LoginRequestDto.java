package com.moit.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class LoginRequestDto {
	
	@NotBlank
	private String loginId;
	
	@NotBlank
	private String password;
	
	@NotNull
    private Long memberTypeId;
	
	@NotBlank
    private String deviceId;
}

package com.moit.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PhoneVerificationRequestDto {
	
	@NotBlank
    private String mobile;
}

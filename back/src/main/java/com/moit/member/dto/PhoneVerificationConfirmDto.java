package com.moit.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PhoneVerificationConfirmDto {
	
	@NotBlank
    private String mobile;

    @NotBlank
    private String code;
}

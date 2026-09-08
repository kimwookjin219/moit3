package com.moit.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EmailVerificationConfirmDto {
	
	@NotBlank
    @Email
    private String email;

    @NotBlank
    private String code;
}

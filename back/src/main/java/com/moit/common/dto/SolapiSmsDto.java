package com.moit.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class SolapiSmsDto {
	
	@Setter
    @Getter
    @NoArgsConstructor
	public static class SolapiSmsRequestDto{
	    private String phoneNumber;
	    private String message;	
	}
	
    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
	public static class SolapiSmsResponseDto{
	    private String message;	
	}	
}

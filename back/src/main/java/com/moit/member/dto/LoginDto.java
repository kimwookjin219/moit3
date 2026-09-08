package com.moit.member.dto;

import lombok.Data;

@Data
public class LoginDto {
	private String loginId;
	private String password;
	private Integer memberTypeId;
	private Integer statusId;
}

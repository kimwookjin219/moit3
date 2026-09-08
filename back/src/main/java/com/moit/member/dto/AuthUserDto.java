package com.moit.member.dto;

import java.util.List;

import lombok.Data;

@Data
public class AuthUserDto {
	private String loginId;
	private String password;
	
	private String nickname;
	private String typeName;
	private String profileUrl;
	private Long statusId;
	private Long memberTypeId;

	private  List<AuthDto> authList;  
	
	private String email;
}

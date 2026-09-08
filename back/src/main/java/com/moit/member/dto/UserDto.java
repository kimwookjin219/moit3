package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class UserDto {
	
	// 기존 DTO - MyBatis, 기존 service에서 계속 사용
	private Long memberId;
	private String  loginId;
	private String  mobile;
	private String  nickname;
	private String  email;
	private String  password;
	private String  profileUrl;
	private String gender;   
    private String joinIp;
    
    private LocalDate birth;
	
	private Long memberTypeId;
	private Long statusId;
	
	private String createdAt;
	private String updatedAt;
	private String deleteYn;
	
	private String provider;
	private String providerId;
	
	private MultipartFile profileImage;
	
	private List<Integer> interestIds;
	
	private Integer point;
	private Integer trustScore;	// 신고 매너점수(신뢰도점수) & 뱃지
	
	// 회원가입 행동 데이터
	private SignupBehaviorDto signupBehavior;
		
	
}

package com.moit.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.SignupBehaviorDto;
import com.moit.member.service.SignupBehaviorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members/signup")
@RequiredArgsConstructor
public class SignupBehaviorController {
	
	
	private final SignupBehaviorService signupBehaviorService;
	
	/*
	 * 회원가입 중 행동 데이터를 분석하여
	 * 실시간 AI 가이드를 반환
	 * */
	
	@PostMapping("/behavior/analyze")
	public ResponseEntity<String> analyzeSignupBehavior(
			@RequestBody SignupBehaviorDto dto
			){
		
		String result = signupBehaviorService.analyzeSignupBehavior(dto);
		
		return ResponseEntity.ok(result);	
	}
	
}

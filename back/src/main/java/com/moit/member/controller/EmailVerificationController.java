package com.moit.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.EmailVerificationConfirmDto;
import com.moit.member.dto.EmailVerificationRequestDto;
import com.moit.member.service.EmailVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members/email")
@RequiredArgsConstructor
public class EmailVerificationController {
	
	private final EmailVerificationService emailVerificationService;
	
	// 이메일 인증번호 발송
	@PostMapping("/send")
	public ResponseEntity<String> sendCode(
			@Valid @RequestBody EmailVerificationRequestDto request
			) {
			    
		emailVerificationService.sendVerificationCode(request.getEmail());
		
		return ResponseEntity.ok("인증번호가 이메일로 발송되었습니다.");
	}
	
	// 이메일 인증번호 확인
	@PostMapping("/verify")
	public ResponseEntity<String> verifyCode(
			@Valid @RequestBody EmailVerificationConfirmDto request
			) {
		
		boolean verifide = emailVerificationService.verifyCode(request.getEmail(), request.getCode());
		
		if(!verifide) { return ResponseEntity.badRequest().body("인증번호가 일치하지 않거나 만료되었습니다."); }
		
		return ResponseEntity.ok("이메일 인증이 완료되었습니다.");
	}
	
}

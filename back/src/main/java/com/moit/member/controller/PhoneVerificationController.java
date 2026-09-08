package com.moit.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.PhoneVerificationConfirmDto;
import com.moit.member.dto.PhoneVerificationRequestDto;
import com.moit.member.service.PhoneVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members/phone")
@RequiredArgsConstructor
public class PhoneVerificationController {
	
	private final PhoneVerificationService phoneVerificationService;
	
	// 휴대본 인증번호 발송
	@PostMapping("/send")
	public ResponseEntity<String> sendCode(
			@Valid @RequestBody PhoneVerificationRequestDto request
			){
		
		phoneVerificationService.sendVerificationCode(request.getMobile());
		
		return ResponseEntity.ok("인증번호가 발송되었습니다.");		
	}
	
	// 휴대폰 인증번호 확인
	@PostMapping("/verify")
	public ResponseEntity<String> verifyCode(
			@Valid @RequestBody PhoneVerificationConfirmDto request
			){
		
		boolean verified = phoneVerificationService.verifyCode(request.getMobile(), request.getCode());
		
		if(!verified) {
			return ResponseEntity.badRequest().body("인증번호가 일치하지 않거나 만료되었습니다.");
		}
		
		return ResponseEntity.ok("휴대폰 인증이 완료되었습니다.");
	}
	
	
}

package com.moit.member.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class EmailVerificationService {
	
	private final JavaMailSender mailSender;
	private final VerificationService verificationService;
	
	@Value("${spring.mail.username}") private String mailUsername;
	
	// 이메일 인증번호 발송
	public void sendVerificationCode(String email) {
		
		//1. 인증번호 생성 + redis에 저장
		String code = verificationService.createEmailCode(email);
	    		
		//2. 이메일 작성
		SimpleMailMessage message = new SimpleMailMessage();
		
		message.setFrom(mailUsername);
		message.setTo(email);
		message.setSubject("[MOIT] 이메일 인증번호");
		
		message.setText(
				"안녕하세요. MOIT입니다.\n\n" + 
				"회원가입을 위한 이메일 인증번호입니다.\n\n" + 
				"인증번호 : " + code + "\n\n" + 
				"본인이 요청하지 않은 경우 해당 메일을 무시해주세요.");
		
		
		//3. 이메일 발송
		mailSender.send(message);
	}
	
	// 이메일 인증번호 확인
	public boolean verifyCode(String email, String code) {
		return verificationService.verifyEmailCode(email, code);
	}

}

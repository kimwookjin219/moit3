package com.moit.member.service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationService {
	
	private final StringRedisTemplate redisTemplate;
    private final SecureRandom random = new SecureRandom();
    
    // 인증번호 유효시간
    private static final long VERIFICATION_EXPIRE_MINUTES = 2;
    private static final long VERIFIED_EXPIRE_MINUTES = 10;
    
    // 이메일 인증번호 저장
    public String createEmailCode(String email) {

        String code = createCode();
        String key = "verification:email:" + email;

        redisTemplate.opsForValue().set(
                key,
                code,
                VERIFICATION_EXPIRE_MINUTES,
                TimeUnit.MINUTES
        );
        return code;
    }
    
    // 이메일 인증번호 확인
    public boolean verifyEmailCode(String email, String code) {

        String key = "verification:email:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);

        if (savedCode == null) { return false; }
        if (!savedCode.equals(code)) { return false; }

        // 인증 성공하면 인증번호 삭제
        redisTemplate.delete(key);

        // 인증 완료 상태 저장
        String verifiedKey = "verification:email:verified:" + email;

        redisTemplate.opsForValue().set(
                verifiedKey,
                "true",
                VERIFIED_EXPIRE_MINUTES,
                TimeUnit.MINUTES
        );
        return true;
    }
    
    // 이메일 인증 완료 여부
    public boolean isEmailVerified(String email) {

        String key = "verification:email:verified:" + email;
        String value = redisTemplate.opsForValue().get(key);

        return "true".equals(value);
    }
    
    // 이메일 인증 완료 상태 삭제
    public void removeEmailVerified(String email) {

        String verifiedKey = "verification:email:verified:" + email;

        redisTemplate.delete(verifiedKey);
    }
    
    // 인증번호 생성
    private String createCode() {

        int number = random.nextInt(900000) + 100000;

        return String.valueOf(number);
    }
    
}

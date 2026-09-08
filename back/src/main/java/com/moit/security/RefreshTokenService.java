package com.moit.security;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    // =========================================================
    // Refresh Token 저장
    // =========================================================
    public void saveRefreshToken(
            Long memberId,
            String deviceId,
            String refreshToken,
            long expirationMillis
    ) {

        String key = createKey(memberId, deviceId);

        redisTemplate.opsForValue().set( key, refreshToken, Duration.ofMillis(expirationMillis) );
    }


    // =========================================================
    // Refresh Token 조회
    // =========================================================
    public String getRefreshToken( Long memberId, String deviceId ) {

        String key = createKey(memberId, deviceId);

        return redisTemplate.opsForValue().get(key);
    }


    // =========================================================
    // Refresh Token 검증
    // =========================================================
    public boolean validateRefreshToken( Long memberId, String deviceId, String refreshToken ) {

        String savedToken = getRefreshToken( memberId, deviceId );

        return refreshToken != null && refreshToken.equals(savedToken);
    }


    // =========================================================
    // 특정 기기의 Refresh Token 삭제
    // =========================================================
    public void deleteRefreshToken( Long memberId, String deviceId ) {

        String key = createKey(memberId, deviceId);

        redisTemplate.delete(key);
    }


    // =========================================================
    // 회원의 모든 Refresh Token 삭제
    // =========================================================
    public void deleteAllRefreshTokens(Long memberId) {

        String pattern = "refreshToken:" + memberId + ":*";

        var keys = redisTemplate.keys(pattern);

        if (keys != null && !keys.isEmpty()) { redisTemplate.delete(keys); }
    }


    // =========================================================
    // Redis Key 생성
    // =========================================================
    private String createKey( Long memberId, String deviceId ) {

        return "refreshToken:" + memberId + ":" + deviceId;
    }
}
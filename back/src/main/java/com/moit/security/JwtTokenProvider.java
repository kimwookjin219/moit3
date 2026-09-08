package com.moit.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {
	
	private final SecretKey secretKey;
	private final Long accessTokenExpSeconds;
	private final Long refreshTokenExpSeconds;
	
	public JwtTokenProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-token-exp-seconds}") Long accessTokenExpSeconds,
			@Value("${jwt.refresh-token-exp-seconds}") Long refreshTokenExpSeconds
			) {
		this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenExpSeconds = accessTokenExpSeconds;
		this.refreshTokenExpSeconds = refreshTokenExpSeconds;
	}
	
	// Access Token 생성
	public String createAccessToken(Long memberId,String loginId,String deviceId) {
		
		Date now = new Date();
		Date expiry = new Date(
				now.getTime() + accessTokenExpSeconds * 1000
				);
		
		return Jwts.builder()
				.setSubject(String.valueOf(memberId))
				.claim("loginId", loginId)
				.claim("deviceId", deviceId)
				.claim("type", "ACCESS")
				.setIssuedAt(now)
				.setExpiration(expiry)
				.signWith(secretKey)
				.compact();		
	}
	
	// Refresh Token 생성
	public String createRefreshToken(Long memberId) {
		
		Date now = new Date();
		Date expiry = new Date(
				now.getTime() + refreshTokenExpSeconds * 1000
				);
		
		return Jwts.builder()
				.setSubject(String.valueOf(memberId))
				.claim("type", "REFRESH")
				.setIssuedAt(now)
				.setExpiration(expiry)
				.signWith(secretKey)
				.compact();	
	}
	
	// JWT에서 회원 ID 가져오기
	public Long getMemberId(String token) {
		
		String subject = Jwts.parserBuilder()
							.setSigningKey(secretKey)
							.build()
							.parseClaimsJws(token)
							.getBody()
							.getSubject();
		
		return Long.valueOf(subject);
	}
	
	public String getDeviceId(String token) {

	    return Jwts.parserBuilder()
	            .setSigningKey(secretKey)
	            .build()
	            .parseClaimsJws(token)
	            .getBody()
	            .get("deviceId", String.class);
	}
	
	// JWT 타입 확인
	public String getTokenType(String token) {

	    return Jwts.parserBuilder()
	            .setSigningKey(secretKey)
	            .build()
	            .parseClaimsJws(token)
	            .getBody()
	            .get("type", String.class);
	}
	
	// JWT 검증
	public boolean validateToken(String token) {
		
		try {
			Jwts.parserBuilder()
				.setSigningKey(secretKey)
				.build()
				.parseClaimsJws(token);
			
			return true;
		}catch(Exception e) {
			return false;
		}
		
	}
	
	// Refresh Token 만료시간 반환
	public long getRefreshTokenExpiration() {
	    return refreshTokenExpSeconds * 1000;
	}
	
	
}

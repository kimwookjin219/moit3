package com.moit.member.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.moit.member.dto.LoginDeviceDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginDeviceServiceImpl implements LoginDeviceService {
	
	private final StringRedisTemplate redisTemplate;
	
	// 로그인 기기 저장
	@Override
	public void saveLoginDevice(Long memberId, String deviceId, String ipAddress, String userAgent, String loginType) {
		
		String key = createKey(memberId, deviceId);

        HashOperations<String, String, String> hash = redisTemplate.opsForHash();

        hash.put(key, "deviceId", deviceId);
        hash.put(key, "ipAddress", ipAddress);
        hash.put(key, "userAgent", userAgent);
        hash.put(key, "loginType", loginType);
        hash.put( key, "lastLoginAt", LocalDateTime.now().toString() );

        // Refresh Token과 동일하게 만료시간 설정
        redisTemplate.expire( key, Duration.ofDays(30) );
		
	}
	
	// 로그인 기기 조회
	@Override
	public List<LoginDeviceDto> getLoginDevices(Long memberId, String currentDeviceId) {
		
		String pattern = "loginDevice:" + memberId + ":*";

        Set<String> keys = redisTemplate.keys(pattern);

        List<LoginDeviceDto> devices = new ArrayList<>();

        if (keys == null || keys.isEmpty()) { return devices; }

        HashOperations<String, String, String> hash = redisTemplate.opsForHash();

        for (String key : keys) {

            String deviceId = hash.get(key, "deviceId");

            String ipAddress = hash.get(key, "ipAddress");

            String userAgent = hash.get(key, "userAgent");

            String loginType = hash.get(key, "loginType");

            String lastLoginAt = hash.get(key, "lastLoginAt");
            
            boolean current = deviceId != null && deviceId.equals(currentDeviceId);
            
            LoginDeviceDto dto = LoginDeviceDto.builder()
		                            .deviceId(deviceId)
		                            .ipAddress(ipAddress)
		                            .userAgent(userAgent)
		                            .loginType(loginType)
		                            .lastLoginAt( lastLoginAt != null ? LocalDateTime.parse(lastLoginAt) : null ).current(current).build();

            devices.add(dto);
        }

        return devices;
	}
	
	// 특정 기기 삭제
	@Override
	public void deleteLoginDevice(Long memberId, String deviceId) {
		
		String key = createKey(memberId, deviceId);

        redisTemplate.delete(key);
		
	}
	
	// 모든 기기 삭제
	@Override
	public void deleteAllLoginDevices(Long memberId) {
		String pattern = "loginDevice:" + memberId + ":*";

        Set<String> keys = redisTemplate.keys(pattern);

        if (keys != null && !keys.isEmpty()) {  redisTemplate.delete(keys); }
	}
	
	@Override
	public boolean existsLoginDevice(Long memberId, String deviceId) {
		
		String key = createKey(memberId, deviceId);

	    return Boolean.TRUE.equals( redisTemplate.hasKey(key) );
	}
	
	// Redis Key 생성
	private String createKey( Long memberId, String deviceId) {

        return "loginDevice:" + memberId + ":" + deviceId;
    }

	
}

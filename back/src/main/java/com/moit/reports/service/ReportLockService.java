package com.moit.reports.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportLockService {

    private final StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "lock:report:";

    public boolean tryLock(Long reportId) {

    	// "lock:report:reportId"
        String lockKey = LOCK_PREFIX + reportId;

        // "lock:report:reportId"이라는 이름의 값이 없으면
        // "LOCKED" 저장 & 5초 후 자동 삭제
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(
                        lockKey,
                        "LOCKED",
                        Duration.ofSeconds(10)
                );

        return Boolean.TRUE.equals(acquired);
    }

    public void unlock(Long reportId) {
        redisTemplate.delete(LOCK_PREFIX + reportId);
    }
}
package com.moit.reports.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.reports.dto.EmailRequestDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FailedEmailQueueService {

	private final StringRedisTemplate redisTemplate;
	private final ObjectMapper objectMapper;

	private static final String FAILED_MAIL_QUEUE = "mail:failed:queue";

	// 실패 메일 Redis Queue 저장
	public void push(EmailRequestDto emailDto) {

		try {	// 실패 메일 넣기
			String json = objectMapper.writeValueAsString(emailDto);
			redisTemplate.opsForList().rightPush(FAILED_MAIL_QUEUE, json);

		} catch (JsonProcessingException e) {
			throw new RuntimeException("실패 메일 Redis 저장 오류", e);
		}
	}

	// 실패 메일 하나 꺼내기
	public EmailRequestDto pop() {
		String json = redisTemplate.opsForList().leftPop(FAILED_MAIL_QUEUE);

		if (json == null) {
			return null;
		}

		try {
			return objectMapper.readValue(json, EmailRequestDto.class);

		} catch (JsonProcessingException e) {
			throw new RuntimeException("Redis 실패 메일 변환 오류", e);
		}
	}
}
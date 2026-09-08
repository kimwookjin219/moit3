package com.moit.review.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ModerationClientService {

    @Value("${openai.api.key}")
    private String apiKey;

    public boolean checkContent(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.error("=== [오류] OpenAI API Key가 주입되지 않았거나 비어 있습니다. .env 및 application.properties 설정을 확인하세요. ===");
        } else {
            log.info("=== [성공] OpenAI API Key 로드 완료 (키 길이: {}) ===", apiKey.length());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey != null ? apiKey.trim() : "");
        headers.setContentType(MediaType.APPLICATION_JSON);

       
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini"); 
        body.put("temperature", 0.0);       // 정확하고 일관된 판별을 위해 0으로 설정

        List<Map<String, String>> messages = List.of(
            Map.of("role", "system", "content", 
                "너는 한국어 리뷰의 욕설 및 비속어 검증기야. " +
                "제시된 문장에 한국어 욕설, 초성 욕설(ㅅㅂ, ㅈㄴ 등), 변형된 욕설, 비하/비방 표현, 무분별한 공격적 언어가 포함되어 있다면 오직 'BAD'라고만 응답해. " +
                "정상적이고 문제없는 문장이라면 오직 'OK'라고만 응답해. 부연 설명은 절대로 하지마."),
            Map.of("role", "user", "content", content)
        );
        body.put("messages", messages);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            RestTemplate restTemplate = new RestTemplate();

           
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    request,
                    String.class
            );

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            
            String resultText = root.path("choices")
                                   .get(0)
                                   .path("message")
                                   .path("content")
                                   .asText()
                                   .trim();

            log.info("=== GPT 욕설 검사 결과 : [{}] (입력 텍스트: {}) ===", resultText, content);

            // "BAD"가 포함되거나 동일하면 true(차단 대상) 반환
            return resultText.toUpperCase().contains("BAD");

        } catch (Exception e) {
            log.error("=== OpenAI Chat API 필터링 오류 ===", e);
            // API 오류 시 리뷰 저장이 막히지 않도록 false 처리
            return false;
        }
    }
}
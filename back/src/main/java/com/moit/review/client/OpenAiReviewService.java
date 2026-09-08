package com.moit.review.client;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.review.dto.ReviewDto.ReviewResponseDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OpenAiReviewService {

    @Value("${openai.api.key}")
    private String apiKey;

    public String reviewAnalysis(List<ReviewResponseDto> reviewList) {

        // 1. 후기가 없을 경우 예외 처리
        if (reviewList == null || reviewList.isEmpty()) {
            return "등록된 모임 후기가 없어 AI 분석을 진행할 수 없습니다.";
        }

        // 2. 후기 내용 합치기
        StringBuilder reviewText = new StringBuilder();
        for (ReviewResponseDto review : reviewList) {
            if (review.getContent() != null && !review.getContent().isBlank()) {
                reviewText.append("- ")
                          .append(review.getContent())
                          .append("\n");
            }
        }

        if (reviewText.isEmpty()) {
            return "분석할 수 있는 후기 내용이 없습니다.";
        }

        // 3. 프롬프트 구성 (안전한 문자열 결합 방식)
        String prompt = "다음은 한 모임에 대한 실제 사용자들의 후기 목록입니다:\n\n"
                + reviewText.toString() + "\n"
                + "위 후기들의 실제 내용만을 바탕으로 오직 아래의 2가지 항목만 한국어로 요약 및 작성해주세요. "
                + "다른 정보나 서론, 후기에 없는 내용은 일절 지어내지 마세요.\n\n"
                + "1. 운영자에게 추천하는 개선 방안\n"
                + "2. 한 줄 총평";

        // 👉 [디버깅용] AI로 전송될 최종 프롬프트 콘솔 출력
        System.out.println("==================== [AI로 전송될 최종 프롬프트] ====================");
        System.out.println(prompt);
        System.out.println("==================================================================");

        // 4. HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 5. Request Body 구성
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);

        body.put("messages", messages);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            // RestTemplate 한글 깨짐 방지 처리
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getMessageConverters()
                        .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    request,
                    String.class
            );

            String json = response.getBody();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);

            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("=== OpenAI API 호출 중 예외 발생 ===", e);
            return "AI 분석 중 오류가 발생했습니다. 원인: " + e.getMessage();
        }
    }
}
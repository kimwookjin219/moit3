package com.moit.qna.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.qna.ai.dto.AiAnalysisResult;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OpenAiService {

	private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.url}")
    private String url;

    public AiAnalysisResult analyze(String text){

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String,Object> body = new HashMap<>();

        body.put("model", model);

        body.put("input", List.of(
                Map.of(
                        "role","user",
                        "content",buildPrompt(text)
                )
        ));

        HttpEntity<Map<String,Object>> entity = new HttpEntity<>(body, headers);
        String response = restTemplate.postForObject(url, entity, String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            String textResult =
                    root.path("output")
                        .get(0)
                        .path("content")
                        .get(0)
                        .path("text")
                        .asText();

            System.out.println("===== GPT 응답 시작 =====");
            System.out.println(textResult);
            System.out.println("===== GPT 응답 끝 =====");

            textResult = textResult
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return objectMapper.readValue(textResult, AiAnalysisResult.class);
            
        } catch (Exception e) {
            throw new RuntimeException("GPT 응답 파싱 실패", e);
        }

    }
    
    private String buildPrompt(String text) {

        return """
            당신은 문의글의 공격성을 분석하는 AI이다.
            반드시 JSON 객체만 반환한다.
	        설명, 코드블록(```), 추가 문장은 절대 출력하지 않는다.
	
	        출력 형식
            {
              "analysis":"NORMAL",
              "score":0,
        	  "aiCategory":"OTHER"
            }
            
	        규칙
	
	        [공격성 분석]
	        - score는 0~100의 정수이다.
	        - score가 0~39이면 일반 문의이다.
	        - score가 40~59이면 다소 공격적인 표현이 있으나 일반 문의이다.
	        - score가 60~100이면 관리자 검토가 필요한 문의이다.
	
	        - analysis는 반드시 NORMAL 또는 PENDING_REVIEW 중 하나이다.
	        - score가 60 이상이면 반드시 PENDING_REVIEW를 반환한다.
	        - score가 59 이하이면 반드시 NORMAL을 반환한다.
	
	        욕설, 협박, 성희롱, 인신공격, 악성 민원은 높은 점수를 부여한다.
	
	        [문의 유형 분류]
	        - aiCategory는 반드시 다음 6개 중 하나만 반환한다.
	          LOGIN
	          PAYMENT
	          ACCOUNT
	          REPORT
	          BUG
	          OTHER
	
	        - LOGIN: 로그인, 비밀번호, 인증, 로그인 실패 등
	        - PAYMENT: 결제, 결제 실패, 결제 내역, 환불 등
	        - ACCOUNT: 회원정보, 계정, 회원가입, 회원탈퇴 등
	        - REPORT: 사용자, 게시글 등의 신고 관련 문의
	        - BUG: 오류, 버그, 화면 문제, 기능이 정상적으로 동작하지 않는 문제
	        - OTHER: 위 카테고리에 해당하지 않는 문의
	
	        문의 내용
	
	        %s
	        """.formatted(text);
    }

}
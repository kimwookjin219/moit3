package com.moit.advertisement.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.advertisement.dto.DashboardAiDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSummaryServiceImpl implements AiSummaryService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String createSummary(DashboardAiDto dto) {

    	try {
    		// 1. 프롬프트 생성
            String prompt = """
                    너는 광고 운영 전문가이다.

                    아래 데이터를 보고
                    5줄 정도로 운영 분석을 작성해라.

                    총 광고 : %d
                    총 노출 : %d
                    총 클릭 : %d
                    평균 CTR : %.2f%%
                    연장률 : %.1f%%
                    교체 권장 광고 : %d개
                    최고 CTR 위치 : %s
                    최저 CTR 위치 : %s
                    가장 많은 광고 등급 : %s

                    아래 형식만 출력한다.

                    📈 AI 운영 분석
                    
					• 첫 번째 분석
					• 두 번째 분석
					• 세 번째 분석
					• 네 번째 분석
					• 다섯 번째 분석
					
					규칙
					- 제목은 첫 줄에만 출력한다.
					- 빈 줄은 절대 넣지 않는다.
					- 정확히 5개의 • 항목만 출력한다.
					- 다른 설명은 절대 하지 않는다.
                    """
                    .formatted(
                            dto.getTotalAd(),
                            dto.getTotalImp(),
                            dto.getTotalClick(),
                            dto.getAvgCtr(),
                            dto.getExtensionRate(),
                            dto.getFatigueWarningCount(),
                            dto.getBestPosition(),
                            dto.getWorstPosition(),
                            dto.getTopGrade()
                    );

            HttpHeaders headers = new HttpHeaders();

            // 2. OpenAI API 호출
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 3. 응답 파싱
            Map<String, Object> body = new HashMap<>();

            body.put("model", "gpt-5");

            body.put("input", prompt);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(body, headers);

            // 4. AI 요약 String 반환
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            "https://api.openai.com/v1/responses",
                            HttpMethod.POST,
                            entity,
                            String.class
                    );

            JsonNode root = objectMapper.readTree(response.getBody());

            for (JsonNode node : root.path("output")) {

                if ("message".equals(node.path("type").asText())) {

                    for (JsonNode content : node.path("content")) {

                        if ("output_text".equals(content.path("type").asText())) {
                            return content.path("text").asText();
                        }
                    }
                }
            }
            return "AI 응답이 없습니다.";
    	} catch (Exception e) {

    	    log.error("AI 광고 통계 요약 생성 중 오류가 발생했습니다.", e);

    	    return "AI 요약 생성 실패";
    	}
  }

}

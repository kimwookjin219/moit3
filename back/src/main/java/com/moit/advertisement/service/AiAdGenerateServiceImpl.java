package com.moit.advertisement.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.advertisement.dto.AiAdRequestDto;
import com.moit.advertisement.dto.AiAdResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAdGenerateServiceImpl implements AiAdGenerateService {


    @Value("${openai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AiAdResponseDto generateAd(AiAdRequestDto dto) {

        try {
            String prompt = """
                    
                    너는 광고 제작 전문가이다.

					입력된 키워드를 기반으로
					광고 제목, 내용, 타겟 연령, 타겟 성별을 생성한다.
					
					규칙:
					- 제목은 클릭을 유도하는 짧은 문장으로 작성
					- 내용은 혜택과 참여 방법이 포함되도록 작성
					- 타겟 연령은 광고 대상에 맞게 판단
					- 성별 판단이 어려우면 ALL 반환
					- targetGender 값은 반드시 ALL, MALE, FEMALE 중 하나만 반환
					
					광고 내용 작성 규칙:
					- 한 문단으로 작성하지 않는다.
					- 혜택, 참여 방법, 추가 혜택, 유의사항을 구분한다.
					- 각 항목은 줄바꿈으로 구분한다.
					- 각 항목 앞에는 "혜택:", "참여 방법:" 같은 제목을 붙인다.
					- 3~5개의 짧은 문단으로 작성한다.

                    키워드:
                    %s


                    JSON 형식으로만 반환한다.

                    {
                     "title":"",
                     "content":"",
                     "targetAgeMin":0,
                     "targetAgeMax":0,
                     "targetGender":"ALL"
                    }

                    """.formatted(dto.getKeyword());

            HttpHeaders headers = new HttpHeaders();

            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String,Object> body = new HashMap<>();

            body.put("model","gpt-5-mini");
            body.put("input",prompt);

            HttpEntity<Map<String,Object>> entity =
                    new HttpEntity<>(body,headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                    "https://api.openai.com/v1/responses",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root =
                    objectMapper.readTree(response.getBody());

            JsonNode output = root.get("output");

            if(output == null || !output.isArray()){
                throw new RuntimeException("AI output 없음");
            }

            String text = null;

            for(JsonNode node : output){
                if("message".equals(node.get("type").asText())){
                	JsonNode content =
                	        node.get("content");

                	if(content != null && content.isArray()){

                	    JsonNode textNode =
                	            content.get(0).get("text");

                	    if(textNode != null){

                	        text = textNode.asText();

                	    }
                	}
                    break;
                }
            }
            log.debug("AI 광고 생성 응답 수신 완료");
            
            if(text == null){
                throw new RuntimeException("AI 응답 없음");
            }
         // GPT markdown 제거
            text = text.replace("```json", "")
                    .replace("```", "")
                    .trim();
            
            AiAdResponseDto result = objectMapper.readValue(
                        text,
                        AiAdResponseDto.class
                    );


            if(!"MALE".equals(result.getTargetGender())
                    &&
               !"FEMALE".equals(result.getTargetGender())){

                result.setTargetGender("ALL");

            }


            return result;

        } catch(Exception e){
        	log.error("AI 광고 생성 중 오류가 발생했습니다. keyword={}", dto.getKeyword(), e);

            AiAdResponseDto fail = new AiAdResponseDto();

            fail.setTitle("");
            fail.setContent("");
            fail.setTargetAgeMin(0);
            fail.setTargetAgeMax(0);
            fail.setTargetGender("ALL");

            return fail;
        }
    }
}
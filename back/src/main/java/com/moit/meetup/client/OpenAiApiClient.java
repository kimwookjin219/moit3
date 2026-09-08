package com.moit.meetup.client;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class OpenAiApiClient {
	@Value("${openai.api.key}") private String apiKey;
	
	private static final String API_URL="https://api.openai.com/v1/chat/completions"; //1. 주소고정
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final RestClient restClient;
	
    public OpenAiApiClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(API_URL).build();
    }	
	
    public String getAIResponse(String userMessage) {
    	Map<String, Object> body = Map.of(
    			"model" , "gpt-4.1" , // "model": "VAR_chat_model_id",
    			"messages" , List.of(
					Map.of(
	    			        "role", "user", 
	    			        "content", userMessage    			        
					)			
    			)
    		);
    	//ex) user -> 당신은 업로드된 문서내용을 기반으로 답변하는 전문 비서입니다.
    	//ex) content -> oo 내용을 이모티콘으로 요약해줘 
    	
    	try {    		
        	//2. RestClient 스타일세팅 값 받아오기
        	String responseBody = restClient.post().contentType(MediaType.APPLICATION_JSON)
        										   .header("Authorization","Bearer " + apiKey) //Bearer 적고 한칸띄기
        										   .body(body)
        										   .retrieve()
        										   .body(String.class); // 응답을 String으로 받음
    		
        	//3. json 파싱    
        	JsonNode root = objectMapper.readTree(responseBody);
        	return root.path("choices").get(0).path("message").path("content").asText();
    	}catch(Exception e) {
    		throw new RuntimeException("open ai 호출 응답파싱오류", e);
    	}
    }
}

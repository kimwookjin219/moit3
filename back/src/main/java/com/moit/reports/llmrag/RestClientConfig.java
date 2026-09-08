package com.moit.reports.llmrag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig { // OpenAI API 호출용 RestClient 객체를 만들어두는 설정 파일
	
	//application-oauth.properties
	@Value("${openai.api.key}")
	private String apiKey;
	
	@Bean
	public RestClient openAiRestClient() { // OpenAI에 요청 보낼 준비가 된 HTTP 클라이언트
		return RestClient.builder()
				.baseUrl("https://api.openai.com/v1")
				.defaultHeader("Authorization", "Bearer " + apiKey)
				.defaultHeader("Content-Type", "application/json")
				.build();
				
	}
}

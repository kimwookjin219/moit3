package com.moit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAiConfig {
	
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean("weatherRestClient")
    public RestClient weatherRestTemplate(RestClient.Builder builder) {
        return builder
        		.baseUrl("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0")
        		.build();
    }    

    @Bean("vworldRestClient")
    public RestClient vworldRestClient() {
        return RestClient.builder()
                .baseUrl("https://api.vworld.kr")
                .build();
    }
    
}

package com.moit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{
	@Value("${upload.path}") private String uploadPath; //    /upload/**
	@Value("${resource.path}") private String resourcePath; // C:/upload
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler(uploadPath)
				.addResourceLocations("file:" + resourcePath + "/");
		
		// 회원 프로필 이미지
	    registry.addResourceHandler("/images/profile/**")
	            .addResourceLocations("file:" + resourcePath + "/profile/");
	    
	    // 문의 이미지
	    registry.addResourceHandler("/images/qna/**")
	            .addResourceLocations("file:///C:/upload/qna/");
	    
	    // 광고 이미지
	    registry.addResourceHandler("/upload/ad/**")
        		.addResourceLocations("file:///C:/upload/ad/");
	}
}

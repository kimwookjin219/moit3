package com.moit.reports.llmrag;

import lombok.Value;

@Value
public class EmbeddingRequest {	// 임베딩 요청
	String model;
	String input;	// 문장을 숫자로 바꾸기
	
}

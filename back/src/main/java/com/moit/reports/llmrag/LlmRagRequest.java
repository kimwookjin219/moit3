package com.moit.reports.llmrag;

import java.util.List;
import lombok.Value;

@Value
public class LlmRagRequest {	// GPT
	String model;
	List<Message> messages;		// 대화 형식으로 요청
	
}

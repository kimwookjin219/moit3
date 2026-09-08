package com.moit.reports.llmrag;

import java.util.List;

public record LlmRagResponse (List<Choice> choices) {	// GPT 응답
	// OpenAI한테서 받은 전체 응답 JSON을 담는 객체
}

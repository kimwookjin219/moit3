package com.moit.reports.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.reports.api.ApiOpenAi;
import com.moit.reports.dto.AiReportsDto;
import com.moit.reports.llmrag.AiService;
import com.moit.reports.llmrag.RagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Reports Api", description = "신고 관련 API")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ApiController {

	private final ApiOpenAi apiOpenAi;
	private final RagService ragService;

	// ApiOpenAi
	@Operation(summary = "AI 신고 내용 작성", description = "키워드, 사유, 타겟타입 기반으로 AI가 신고 내용을 작성합니다.")
	@PostMapping("/openai")
	public ResponseEntity<String> createReportApiOpenAi(@RequestBody AiReportsDto dto) {

		String response = apiOpenAi.getAIResponse(dto);
		return ResponseEntity.ok(response);
	}
	
	
	// LLM-RAG
	@Operation(summary = "관리자 신고 처리 AI 판단 보조",
			description = "현재 신고 내용과 신고 대상 원문을 조회하고 "
						+ "신고 처리 기준 및 과거 유사 사례 PDF를 기반으로 "
						+ "관리자 판단 보조 결과를 생성합니다.")
	@PostMapping("/admin/{reportId}/ai-analysis")
	public ResponseEntity<String> analyzeReport(@PathVariable("reportId") Long reportId) {

		String answer = ragService.analyzeReport(reportId);
		return ResponseEntity.ok(answer);
	}
    
}

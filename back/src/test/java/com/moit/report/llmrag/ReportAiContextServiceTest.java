package com.moit.report.llmrag;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.moit.reports.enums.TargetType;
import com.moit.reports.llmrag.ReportAiContext;
import com.moit.reports.llmrag.ReportAiContextService;

@SpringBootTest
class ReportAiContextServiceTest {

	@Autowired
	private ReportAiContextService reportAiContextService;

	@Test
	@DisplayName("신고 정보 + 신고 대상 원문 조회 테스트")
	void getReportContextTest() {

		Long reportId = 3L;

		// 신고 + 신고 대상 원문 조회
		ReportAiContext context = reportAiContextService.getReportContext(reportId);

		System.out.println();
		System.out.println("===== AI 신고 Context 조회 테스트 =====");
		System.out.println("신고 번호: " + context.getReportId());
		System.out.println("신고 대상 타입: " + context.getTargetType());
		System.out.println("신고 대상 ID: " + context.getTargetId());
		System.out.println("신고 사유: " + context.getReasonCode());
		System.out.println("신고 상세 내용: " + context.getReasonDetail());
		
		System.out.println("\n===== 신고 대상 원문 =====");
		System.out.println(context.getTargetContent());

		System.out.println("=========================\n");

		// 조회 성공 여부 확인
		assertThat(context.getReportId()).isEqualTo(reportId);
		assertThat(context.getTargetType()).isEqualTo(TargetType.MEETUP);
		assertThat(context.getTargetContent()).contains("[신고 대상 모임]");
	}

	@Test
	@DisplayName("리뷰 신고 원문 조회 테스트")
	void getReviewReportContextTest() {

		Long reportId = 22L;		// REVIEW 타입인 실제 reportId

		ReportAiContext context = reportAiContextService.getReportContext(reportId);

		System.out.println();
		System.out.println("===== 리뷰 신고 테스트 =====");
		System.out.println("대상 타입: " + context.getTargetType());
		System.out.println("신고 유형: " + context.getReasonCode());
		System.out.println("신고 내용: " + context.getReasonDetail());
		System.out.println(context.getTargetContent());
		System.out.println("========================");

		assertThat(context.getTargetType()).isEqualTo(TargetType.REVIEW);
		assertThat(context.getTargetContent()).contains("[신고 대상 리뷰]");
	}
}
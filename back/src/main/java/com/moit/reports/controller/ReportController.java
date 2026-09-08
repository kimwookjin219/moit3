package com.moit.reports.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.reports.dto.ReportAuditLogDto;
import com.moit.reports.dto.ReportSearchDto;
import com.moit.reports.dto.ReportsDto.ReportListResponseDto;
import com.moit.reports.dto.ReportsDto.ReportProcessDto;
import com.moit.reports.dto.ReportsDto.ReportRequestDto;
import com.moit.reports.dto.ReportsDto.ReportResponseDto;
import com.moit.reports.enums.TargetType;
import com.moit.reports.service.ReportsService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Reports Api", description = "신고 관련 API")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

	private final ReportsService reportsService;

	// test button
//	@RequestMapping("/user/meetup/report/button")
//    public String reportButton() {
//        return "user/meetup/report/button";
//    }

	// 로그인 헬퍼
	private Long getLoginMemberId(Authentication authentication) {
		CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

		return userDetails.getAppUserId();
	}

	// 신고 작성
	@Operation(summary = "사용자 신고 작성", description = "")
	@PostMapping
	public ResponseEntity<ReportResponseDto> createReport(
			Authentication authentication,
//       	@Parameter(description = "작성자 ID") @RequestParam("memberId") Long memberId,
			@RequestBody ReportRequestDto requestDto) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		return ResponseEntity.ok(reportsService.createUserReport(memberId, requestDto));
	};

	// 신고 수정
	@Operation(summary = "사용자 신고 수정", description = "")
	@PatchMapping(value = "/{reportId}")
	public ResponseEntity<ReportResponseDto> updateReport(
			Authentication authentication,
			@Parameter(description = "수정할 신고글 ID") @PathVariable(name = "reportId") Long reportId,
			@RequestBody ReportRequestDto requestDto) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		ReportResponseDto response = reportsService.updateUserReport(reportId, memberId, requestDto);
		return ResponseEntity.ok(response);
	};

	// 신고 삭제
	@Operation(summary = "사용자 신고 삭제", description = "")
	@DeleteMapping("/{reportId}")
	public ResponseEntity<Long> deleteReport(
			Authentication authentication,
			@PathVariable("reportId") Long reportId) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		reportsService.deleteUserReport(reportId, memberId);
		return ResponseEntity.ok(reportId);
	}

	// 내 신고내역 조회 (사용자 신고 목록 조회 + 페이징)
	@Operation(summary = "내 신고내역 조회", description = "")
	@GetMapping
	public ResponseEntity<ReportListResponseDto> getReportsMylist(
			Authentication authentication,
//       	@Parameter(description = "작성자 ID") @RequestParam("memberId") Long memberId,
			@PageableDefault(size = 10) Pageable pageable) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		ReportListResponseDto response = reportsService.getUserReports(memberId, pageable);
		return ResponseEntity.ok(response);
	}

	// 사용자 신고 상세 조회
	@Operation(summary = "내 신고내역 상세조회", description = "")
	@GetMapping("/{reportId}")
	public ResponseEntity<ReportResponseDto> getReportMylistDetail(
			Authentication authentication,
			@PathVariable("reportId") Long reportId) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		ReportResponseDto report = reportsService.getUserReportDetail(reportId, memberId);
		return ResponseEntity.ok(report);
	}

	// 중복 신고 확인 (true = 중복 신고, false = 신고 가능)
	@Operation(summary = "사용자 중복 신고 확인", description = "같은 사용자가 같은 모임/리뷰를 이미 신고했는지 확인합니다.")
	@GetMapping("/checkDoubleReport")
	public ResponseEntity<Boolean> checkDoubleReport(
			Authentication authentication,
//			@RequestParam("memberId") Long memberId,
			@RequestParam("targetType") TargetType targetType,
			@RequestParam("targetId") Long targetId) {

		// 로그인한 memberId 꺼내오기
		Long memberId = getLoginMemberId(authentication);

		boolean response = reportsService.checkDoubleReport(memberId, targetType, targetId);
		return ResponseEntity.ok(response);
	}

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////
	// 관리자 신고 수정
	@Operation(summary = "관리자 신고 처리 (승인/반려)", description = "")
	@PatchMapping(value = "/admin/{reportId}")
	public ResponseEntity<ReportResponseDto> updateAdminReport(
			Authentication authentication,
			@Parameter(description = "처리할 신고글 ID") @PathVariable(name = "reportId") Long reportId,
			@RequestBody ReportProcessDto processDto) {

		// 로그인한 adminMemberId 꺼내오기
		Long adminMemberId = getLoginMemberId(authentication);
		
		ReportResponseDto response = reportsService.updateAdminReport(reportId, adminMemberId, processDto);
		return ResponseEntity.ok(response);
	};

	// 관리자 신고 삭제
	@Operation(summary = "관리자 신고 삭제", description = "")
	@DeleteMapping("/admin/{reportId}")
	public ResponseEntity<Long> deleteAdminReport(
			Authentication authentication,
			@PathVariable("reportId") Long reportId,
			@RequestParam("processReason") String processReason) {

		// 로그인한 adminMemberId 꺼내오기
		Long adminMemberId = getLoginMemberId(authentication);
		
		reportsService.deleteAdminReport(reportId, adminMemberId, processReason);
		return ResponseEntity.ok(reportId);
	}

	// 관리자 신고 목록 조회 + 검색 + 페이징
	@Operation(summary = "관리자 신고 목록 조회", description = "필터(버튼)이랑 서치(키워드)를 혼합하여 검색합니다.")
	@GetMapping("/admin/adminReportsList")
	public ResponseEntity<ReportListResponseDto> getReportsAdmin(
			@ModelAttribute ReportSearchDto searchDto, // 검색조건
			@PageableDefault(size = 10) Pageable pageable) {

		ReportListResponseDto response = reportsService.getAdminReports(searchDto, pageable);
		return ResponseEntity.ok(response);
	}

	// 관리자 리스트 상세보기
	@Operation(summary = "관리자 리스트 상세 조회", description = "관리자 리스트를 상세 조회합니다.")
	@GetMapping("/admin/{reportId}")
	public ResponseEntity<ReportResponseDto> getReportAdminDetail(
			@PathVariable("reportId") Long reportId) {
		
		ReportResponseDto report = reportsService.getAdminReportDetail(reportId);
		return ResponseEntity.ok(report);
	}
	
	// 관리자 통계
	@GetMapping("/admin/stats")
	public ResponseEntity<Map<String, Long>> getAdminReportStats() {

		Map<String, Long> response = reportsService.getAdminReportStats();
		return ResponseEntity.ok(response);
	}

	//////////////////////////////////////////////////////////
	// 관리자 신고 처리 로그 조회
	@Operation(summary = "관리자 신고 처리 로그 조회", description = "신고별 관리자 처리 이력을 조회합니다.")
	@GetMapping("/admin/{reportId}/auditLogs")
	public ResponseEntity<List<ReportAuditLogDto>> getReportAuditLogs(
			@PathVariable("reportId") Long reportId) {

		List<ReportAuditLogDto> response = reportsService.getReportAuditLogs(reportId);
		return ResponseEntity.ok(response);
	}
}

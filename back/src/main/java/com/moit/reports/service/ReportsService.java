package com.moit.reports.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;

import com.moit.reports.dto.ReportAuditLogDto;
import com.moit.reports.dto.ReportSearchDto;
import com.moit.reports.dto.ReportsDto.ReportListResponseDto;
import com.moit.reports.dto.ReportsDto.ReportProcessDto;
import com.moit.reports.dto.ReportsDto.ReportRequestDto;
import com.moit.reports.dto.ReportsDto.ReportResponseDto;
import com.moit.reports.entity.ReportAuditLog;
import com.moit.reports.enums.TargetType;

public interface ReportsService {
	
	// ============
	// =   user   =
	// ============
	// 사용자 신고 작성
	ReportResponseDto createUserReport(Long memberId, ReportRequestDto requestDto);
	
	// 사용자 신고 수정
	// findByReportIdAndMember_IdAndDeleteYnAndStatus
	ReportResponseDto updateUserReport(Long reportId, Long memberId, ReportRequestDto requestDto);
	
	// 사용자 신고 삭제 (논리삭제 update delete_yn = 'Y')
	void deleteUserReport(Long reportId, Long memberId);
	
	// 사용자 신고 목록 조회 + 페이징
	// findByMember_IdAndDeleteYnOrderByReportIdDesc
	ReportListResponseDto getUserReports(Long memberId, Pageable pageable);
	
	// 사용자 신고 상세 조회
	// findByReportIdAndMember_IdAndDeleteYn
	ReportResponseDto getUserReportDetail(Long reportId, Long memberId);

	// 중복 신고 확인
	// existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn
	boolean checkDoubleReport(Long memberId, TargetType targetType, Long targetId);

	
	// =============
	// =   admin   =
	// =============
	// 관리자 처리 상태 (승인/반려/신뢰도점수/감사로그) 변경
	// findByReportIdAndStatus
	ReportResponseDto updateAdminReport(Long reportId, Long memberId, ReportProcessDto processDto);
	
	// 관리자 신고 삭제 (물리삭제 -> 논리삭제 변경 + 감사 로그 processReason 포함)
	void deleteAdminReport(Long reportId, Long memberId, String processReason);
	
	// 관리자 신고 목록 조회 + 검색 + 페이징
	ReportListResponseDto getAdminReports(ReportSearchDto searchDto, Pageable pageable);

	// 관리자 신고 상세 조회
	ReportResponseDto getAdminReportDetail(Long reportId);
	
	// 관리자 통계
    Map<String, Long> getAdminReportStats();
	
	
	// =====================
	// =   adminAuditLog   =
	// =====================
	// 신고별 관리자 처리 이력 로그 조회
	List<ReportAuditLogDto> getReportAuditLogs(Long reportId);

	// 관리자 처리 로그 자동 삭제 (3년 전)
	long deleteAuditLogs();
	
	// ================
	// =   apiEmail   =
	// ================
	// 3일 전 신고 처리한 이메일 발송
	void sendThreeDaysAgoReportEmails();
}

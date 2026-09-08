package com.moit.reports.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.moit.reports.entity.ReportAuditLog;

@Repository
public interface ReportAuditLogRepository extends JpaRepository<ReportAuditLog, Long> {
	
	// 관리자 처리 로그 조회
	List<ReportAuditLog> findByReport_ReportIdOrderByProcessedAtDesc(Long reportId);
	
	// 관리자 처리 기간 조회 (3일 전)
	List<ReportAuditLog> findByProcessedAtBetweenAndThreeDayEmailSentYn(
			LocalDateTime start, LocalDateTime end,
			Character threeDayEmailSentYn);
	
	// 관리자 처리 로그 자동 삭제 (3년 전)
	long deleteByProcessedAtBefore(LocalDateTime cutoff);
}

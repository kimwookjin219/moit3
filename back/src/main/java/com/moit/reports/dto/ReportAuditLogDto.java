package com.moit.reports.dto;

import java.time.LocalDateTime;

import com.moit.reports.entity.ReportAuditLog;
import com.moit.reports.enums.ReportStatus;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReportAuditLogDto {	// 관리자 처리 내역 로그
	
	private Long auditLogId;		// 처리 로그 id
	private Long reportId;			// 신고 id

	private Long adminMemberId;		// 처리 관리자
	private String adminNickname;	// 관리자 닉네임

	private ReportStatus previousStatus;	// 변경 전 상태
	private ReportStatus changedStatus;		// 변경 후 상태
	private String processReason;		// 관리자 처리 사유
	private Integer trustScoreChange;	// 신고 처리로 변화한 신뢰도 점수
	private LocalDateTime processedAt;	// 처리 시각
	
	
	
	public static ReportAuditLogDto from(ReportAuditLog log) {

	    ReportAuditLogDto dto = new ReportAuditLogDto();

	    dto.setAuditLogId(log.getAuditLogId());
	    dto.setReportId(log.getReport().getReportId());

	    if (log.getAdminMember() != null) {
	        dto.setAdminMemberId(log.getAdminMember().getId());
	        dto.setAdminNickname(log.getAdminMember().getNickname());
	    }
	    
	    dto.setPreviousStatus(log.getPreviousStatus());
	    dto.setChangedStatus(log.getChangedStatus());
	    dto.setProcessReason(log.getProcessReason());
	    dto.setTrustScoreChange(log.getTrustScoreChange());
	    dto.setProcessedAt(log.getProcessedAt());

	    return dto;
	}
}

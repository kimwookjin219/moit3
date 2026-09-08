package com.moit.reports.entity;

import java.time.LocalDateTime;

import com.moit.member.entity.Member;
import com.moit.reports.enums.ReportAuditAction;
import com.moit.reports.enums.ReportStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "REPORT_AUDIT_LOGS")	// 신고 처리 이력
@Getter @Setter @NoArgsConstructor
public class ReportAuditLog {
    @Id
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "report_audit_log_seq_generator")
    @SequenceGenerator( name = "report_audit_log_seq_generator", sequenceName = "REPORT_AUDIT_LOG_SEQ", allocationSize = 1)
    @Column(name = "AUDIT_LOG_ID")
    private Long auditLogId;

    // 처리된 신고
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REPORT_ID", nullable = false)
    private Report report;
//	entity.Report 에 추가
//  @OneToMany(mappedBy = "report")
//	private List<ReportAuditLog> reportAuditLogs = new ArrayList<>();

    // 신고를 처리한 관리자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ADMIN_ID", nullable = false)
    private Member adminMember;
//	entity.Member 에 추가
//	@OneToMany(mappedBy = "adminMember")
//	private List<ReportAuditLog> reportAuditLogs = new ArrayList<>();
    
    // 액션 타입 (StatusChanged or Deleted)
    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION_TYPE", nullable = false, length = 30)
    private ReportAuditAction actionType;
    
    // 변경 전 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "PREVIOUS_STATUS", nullable = false, length = 20)
    private ReportStatus previousStatus;
    
    // 변경 후 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "CHANGED_STATUS", length = 20)
    private ReportStatus changedStatus;

    // 관리자가 입력한 처리 사유
    @Column(name = "PROCESS_REASON", nullable = false, length = 1000)
    private String processReason;
    
    // 관리자 처리 시각
    @Column(name = "PROCESSED_AT", nullable = false, updatable = false)
    private LocalDateTime processedAt;
    
    @PrePersist
    void onProcess() {
    	this.processedAt = LocalDateTime.now();
    }

    // 변화한 신뢰도 점수
    @Column(name = "TRUST_SCORE_CHANGE", nullable = false)
    private Integer trustScoreChange;
    
    // 3일 전 이메일 전송 여부 확인
    @Column(name = "THREE_DAYS_EMAIL_SENT_YN")
    private Character threeDayEmailSentYn = 'N';

	
	// 승인/반려 감사 로그
	public static ReportAuditLog statusChanged (
	        Report report,
	        Member adminMember,
	        ReportStatus previousStatus,
	        ReportStatus changedStatus,
	        String processReason,
	        Integer trustScoreChange ) {
		
	    ReportAuditLog log = new ReportAuditLog();
	    log.report = report;
	    log.adminMember = adminMember;
	    log.actionType = ReportAuditAction.STATUS_CHANGED;
	    log.previousStatus = previousStatus;
	    log.changedStatus = changedStatus;
	    log.processReason = processReason;
	    log.trustScoreChange = trustScoreChange;
	    
	    return log;
	}
	
	// 논리삭제 감사 로그
	public static ReportAuditLog deleted (
	        Report report,
	        Member adminMember,
	        String processReason ) {
		
	    ReportAuditLog log = new ReportAuditLog();
	    log.report = report;
	    log.adminMember = adminMember;
	    log.actionType = ReportAuditAction.DELETED;
	    log.previousStatus = report.getStatus();	// 삭제 전 신고의 처리 상태는 보존
	    log.changedStatus = null;					// 삭제는 상태변경이 아니므로 null
	    log.processReason = processReason;
	    log.trustScoreChange = 0;
	    
	    return log;
	}
}
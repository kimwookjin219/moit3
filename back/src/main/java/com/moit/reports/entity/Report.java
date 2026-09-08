package com.moit.reports.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.moit.member.entity.Member;
import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.ReportStatus;
import com.moit.reports.enums.TargetType;
import com.moit.util.BaseEntity;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "REPORTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Report extends BaseEntity {
//	@Id
//	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reportId_seq")
//	@SequenceGenerator(name = "reportId_seq", sequenceName = "REPORT_SEQ", allocationSize = 1)
//	@Column(name = "REPORT_ID")
//	private Long reportId;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "REPORT_ID")
	private Long reportId;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "TARGET_TYPE", length = 20, nullable = false)
	private TargetType targetType;
	
	@Column(name = "TARGET_ID", nullable = false)
	private Long targetId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MEMBER_ID", nullable = false)
	private Member member;
//	entity.Member 에 추가
//	@OneToMany(mappedBy = "member")
//	private List<Report> reports = new ArrayList<>();
	
	@Enumerated(EnumType.STRING)
	@Column(name = "REASON_CODE", length = 20, nullable = false)
	private ReasonCode reasonCode;
	
	@Column(name = "REASON_DETAIL", length = 200)
	private String reasonDetail;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "STATUS", length = 20, nullable = false)
	private ReportStatus status;
	
	// 사용자 수정일자
	@Column(name = "user_updated_at")
	private LocalDateTime userUpdatedAt;
	
	// 
	public Report(TargetType targetType, Long targetId, Member member, ReasonCode reasonCode, String reasonDetail) {
		this.targetType = targetType;
		this.targetId = targetId;
		this.member = member;
		this.reasonCode = reasonCode;
		this.reasonDetail = reasonDetail;
		this.status = ReportStatus.PENDING;
	}
	
	// 사용자 신고 사유 코드 및 내용 수정
	public void updateReason(ReasonCode reasonCode, String reasonDetail) {
        this.reasonCode = reasonCode;
        this.reasonDetail = reasonDetail;
    }
	
	// 관리자 (승인/반려) 처리 상태 변경
    public void changeStatus(ReportStatus status) { this.status = status; }
    
    @OneToMany( mappedBy = "report")
	private List<ReportAuditLog> reportAuditLogs = new ArrayList<>();
}
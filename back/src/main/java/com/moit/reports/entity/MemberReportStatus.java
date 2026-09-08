package com.moit.reports.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
	name = "MEMBER_REPORT_STATUS",
	uniqueConstraints = {
    @UniqueConstraint(
        name = "UK_MEMBER_REPORT_STATUS_CODE",
        columnNames = "STATUS_CODE"
    )
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberReportStatus {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "report_status_seq")
	@SequenceGenerator(name = "report_status_seq", sequenceName = "REPORT_STATUS_SEQ", allocationSize = 1)
	@Column(name = "REPORT_STATUS_ID")
	private Long reportStatusId;
	
	@Column(name = "STATUS_CODE", length = 20, nullable = false)
	private String statusCode;
	
	@Column(name = "STATUS_NAME", length = 20, nullable = false)
	private String statusName;

	// 신고 뱃지
	public MemberReportStatus(String statusCode, String statusName) {
		this.statusCode = statusCode;
		this.statusName = statusName;
	}
	
	// 뱃지 상태 업데이트
	public void updateStatusName(String statusName) {
        this.statusName = statusName;
    }
}
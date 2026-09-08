package com.moit.member.entity;

import java.time.LocalDate;

import com.moit.reports.entity.MemberReportStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member_info")
@Getter @Setter
@NoArgsConstructor
public class MemberInfo {
	
	@Id
	@Column(name = "member_id")
	private Long id;
	
	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
    @JoinColumn(name = "member_id")
	private Member member;
	
	@Column(nullable = false, length = 1)
	private String gender;
	
	private LocalDate birth;
	
	@Column(nullable = false)
	private Integer point;
	
	@Column(name = "trust_score", nullable = false)
	private Integer trustScore;
	
	@Column(name = "login_ip")
	private String loginIp;
	
	
	@Column(name = "join_ip")
	private String joinIp;
	
	@Column(name = "ai_summary")
	private String aiSummary;
	
	@PrePersist
	void prePersist() {
		if(point == null)
	        point = 0;

	    if(trustScore == null)
	        trustScore = 100;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "report_status_id", nullable = false)
	private MemberReportStatus memberReportStatus;
}

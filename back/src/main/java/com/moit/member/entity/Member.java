package com.moit.member.entity;

import java.util.ArrayList;
import java.util.List;

import com.moit.qna.entity.Question;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.entity.Report;
import com.moit.reports.entity.ReportAuditLog;
//import com.moit.reports.entity.Report;
//import com.moit.reports.entity.ReportAuditLog;
import com.moit.util.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "members")
@Getter @Setter
@NoArgsConstructor
public class Member extends BaseEntity{
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "members_seq")
	@SequenceGenerator(name = "members_seq", sequenceName = "members_seq",allocationSize = 1)
	@Column(name = "member_id")
	private Long id;
	
	@Column(name = "login_id", nullable = false, unique = true)
	private String loginId;
	
	@Column
	private String mobile;
	
	@Column(nullable = false, unique = true)
	private String nickname;
	
	@Column(nullable = false, unique = true)
	private String email;
	
	@Column(nullable = false)
	private String password;
	
	@Column(name = "profile_url")
	private String profileUrl;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_type_id", nullable = false)
	private MemberType memberType;
	
	@Column(name = "provider")
	private String provider;

	@Column(name = "provider_id")
	private String providerId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "status_id", nullable = false)
	private MemberStatus memberStatus;
	
	@OneToOne(mappedBy = "member", fetch = FetchType.LAZY)
	private MemberInfo memberInfo;
	
	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL , orphanRemoval = true)
	private List<MemberInterest> memberInterests = new ArrayList<>();

	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL , orphanRemoval = true)
	private List<PointHistory> pointHistories = new ArrayList<>();
	
	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Question> questions = new ArrayList<>();
	
	// 내가 작성한 신고
    @OneToMany(mappedBy = "member")
    private List<Report> reports = new ArrayList<>();
   
    // 관리자가 처리한 신고 이력 로그
    @OneToMany(mappedBy = "adminMember")
    private List<ReportAuditLog> reportAuditLogs = new ArrayList<>();
    
	
}

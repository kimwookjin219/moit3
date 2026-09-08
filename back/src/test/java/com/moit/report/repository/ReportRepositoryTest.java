package com.moit.report.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.moit.member.entity.Member;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.entity.Report;
import com.moit.reports.entity.ReportAuditLog;
import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.ReportStatus;
import com.moit.reports.enums.TargetType;
import com.moit.reports.repository.MemberReportStatusRepository;
import com.moit.reports.repository.ReportAuditLogRepository;
import com.moit.reports.repository.ReportRepository;

import jakarta.persistence.EntityManager;

@EnableJpaRepositories(basePackageClasses = { ReportRepository.class, MemberReportStatusRepository.class,
		ReportAuditLogRepository.class, })
@ImportAutoConfiguration(exclude = { JpaRepositoriesAutoConfiguration.class })
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ReportRepositoryTest {

	@Autowired
	private ReportRepository reportRepository;
	@Autowired
	private MemberReportStatusRepository memberReportStatusRepository;
	@Autowired
	private ReportAuditLogRepository reportAuditLogRepository;

	@Autowired
	private EntityManager entityManager;
	// 테스트 유저 생성
	private Member testMember;

	@BeforeEach
	void setUp() {
		MemberType memberType = new MemberType();
		memberType.setMemberTypeId(1L);
		memberType.setTypeName("USER");
		entityManager.persist(memberType);

		MemberStatus memberStatus = new MemberStatus();
		memberStatus.setStatusId(1L);
		memberStatus.setStatusName("ACTIVE");
		entityManager.persist(memberStatus);

		testMember = new Member();
		testMember.setLoginId("report_test_user");
		testMember.setMobile("01012345678");
		testMember.setNickname("신고테스트회원");
		testMember.setEmail("test@test.com");
		testMember.setPassword("1234");

		testMember.setMemberType(memberType);
		testMember.setMemberStatus(memberStatus);
		entityManager.persist(testMember);
		entityManager.flush();

		assertThat(testMember.getId()).isNotNull();
	}
	
	private Report createReport(TargetType targetType, Long targetId, ReasonCode reasonCode, String reasonDetail) {
		Report report = new Report(targetType, targetId, testMember, reasonCode, reasonDetail);
		return reportRepository.saveAndFlush(report);
	}

	
	
	// --- ReportRepository Test ---
	// --- ReportRepository Test ---
	@Test
	@DisplayName("신고 글 작성")
	void ReportRepositorySaveTest() {
		Report report = new Report( TargetType.MEETUP,
									1L,
									testMember,
									ReasonCode.SPAM,
									"광고성 게시글 신고");

		Report saved = reportRepository.saveAndFlush(report);
		Optional<Report> found = reportRepository.findById(saved.getReportId());

		assertThat(saved.getReportId()).isNotNull();
		assertThat(found).isPresent();
		assertThat(found.get().getTargetType()).isEqualTo(TargetType.MEETUP);
		assertThat(found.get().getTargetId()).isEqualTo(1L);
		assertThat(found.get().getReasonCode()).isEqualTo(ReasonCode.SPAM);
		assertThat(found.get().getReasonDetail()).isEqualTo("광고성 게시글 신고");
		assertThat(found.get().getStatus()).isEqualTo(ReportStatus.PENDING);
		assertThat(found.get().getMember().getId()).isEqualTo(testMember.getId());
	}

	@Test
	@DisplayName("사용자 신고 목록 조회 + 페이징")
	void findByMember_IdAndDeleteYnOrderByReportIdDesc() {
		createReport(
			TargetType.MEETUP,
			1L,
			ReasonCode.SPAM,
			"신고 테스트 1 - 신고 목록 조회"
		);
		createReport(
			TargetType.REVIEW,
			2L,
			ReasonCode.ABUSE,
			"신고 테스트 2 - 페이징"
		);
		
		Pageable pageable = PageRequest.of(0, 10);
		
		Page<Report> result =
			reportRepository.findByMember_IdAndDeleteYnOrderByReportIdDesc(
				testMember.getId(), 'N', pageable
			);
		
		assertThat(result).isNotNull();
		assertThat(result.getContent()).hasSize(2);
	}

	@Test
	@DisplayName("사용자 신고 상세 조회")
	void findByReportIdAndMember_IdAndDeleteYn() {
		Report saved =
			createReport(
				TargetType.MEETUP,
				3L,
				ReasonCode.ETC,
				"신고 테스트 3 - 상세 조회"
			);
		
		Optional<Report> found =
			reportRepository.findByReportIdAndMember_IdAndDeleteYn(
				saved.getReportId(), testMember.getId(), 'N');

		assertThat(found).isPresent();
		assertThat(found.get().getReportId()).isEqualTo(saved.getReportId());
		assertThat(found.get().getMember().getId()).isEqualTo(testMember.getId());
		assertThat(found.get().getReasonDetail()).isEqualTo("신고 테스트 3 - 상세 조회");
	}

	@Test
	@DisplayName("사용자 신고 수정")
	void findByReportIdAndMember_IdAndDeleteYnAndStatus() {
		Report saved =
			createReport(
				TargetType.MEETUP,
				4L,
				ReasonCode.ETC,
				"신고 테스트 4 - 신고 수정 전 내용"
			);
		
		Optional<Report> found = reportRepository
			.findByReportIdAndMember_IdAndDeleteYnAndStatus(
				saved.getReportId(),
				testMember.getId(),
				'N',
				ReportStatus.PENDING
			);
		assertThat(found).isPresent();
		
		Report report = found.get();
		report.updateReason(
			ReasonCode.ABUSE,
			"신고 테스트 4 - 수정 후 내용"
		);

		reportRepository.flush();

		Report updated =
			reportRepository.findById(report.getReportId()).orElseThrow();

		assertThat(updated.getReasonCode()).isEqualTo(ReasonCode.ABUSE);
		assertThat(updated.getReasonDetail()).isEqualTo("신고 테스트 4 - 수정 후 내용");
	}

	@Test
	@DisplayName("중복 신고 확인")
	void existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn() {
		createReport(
			TargetType.MEETUP,
			5L,
			ReasonCode.SPAM,
			"신고 테스트 5 - 중복 신고 테스트"
		);
		
		boolean result =
			reportRepository.existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn(
				testMember.getId(),
				TargetType.MEETUP,
				5L,
				'N'
			);
		
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("관리자 처리 상태 변경")
	void findByReportIdAndStatus() {
		Report saved =
			createReport(
				TargetType.MEETUP,
				106L,
				ReasonCode.SPAM,
				"신고 테스트 6 - 관리자 처리 상태 변경 테스트"
			);
		assertThat(saved.getStatus()).isEqualTo(ReportStatus.PENDING);

		Optional<Report> found =
			reportRepository.findByReportIdAndStatus(
				saved.getReportId(),
				ReportStatus.PENDING
			);
		assertThat(found).isPresent();

		Report report = found.get();
		report.changeStatus(ReportStatus.APPROVED);

		reportRepository.flush();

		Report changed =
			reportRepository.findById(report.getReportId()).orElseThrow();

		assertThat(changed.getStatus()).isEqualTo(ReportStatus.APPROVED);
	}

	
	
	// --- MemberReportStatusRepository Test ---
	// --- MemberReportStatusRepository Test ---
	@Test
	@DisplayName("회원 신고 상태 저장")
	void memberReportStatusSaveTest() {
		MemberReportStatus status = new MemberReportStatus("NORMAL", "정상회원");
		MemberReportStatus saved = memberReportStatusRepository.save(status);

		assertThat(saved.getReportStatusId()).isNotNull();
		assertThat(saved.getStatusCode()).isEqualTo("NORMAL");
		assertThat(saved.getStatusName()).isEqualTo("정상회원");
	}

	@Test
	@DisplayName("상태 코드로 회원 신고 상태 조회")
	void FindByStatusCode() {
		memberReportStatusRepository.save(new MemberReportStatus("WARNING", "주의회원"));
		MemberReportStatus found = memberReportStatusRepository.findByStatusCode("WARNING").orElseThrow();

		assertThat(found.getStatusCode()).isEqualTo("WARNING");
		assertThat(found.getStatusName()).isEqualTo("주의회원");
	}

	@Test
	@DisplayName("상태 코드 존재 여부 테스트")
	void existsByStatusCode() {
		memberReportStatusRepository.save(new MemberReportStatus("BLOCK", "정지회원"));
		boolean result = memberReportStatusRepository.existsByStatusCode("BLOCK");

		assertThat(result).isTrue();
	}

	
	
	// --- ReportAuditLogRepository ---
	// --- ReportAuditLogRepository ---
	@Test
	@DisplayName("관리자 처리 조회")
	void findByReport_ReportIdOrderByProcessedAtDesc() {
		Report report =
			createReport(
				TargetType.MEETUP,
				107L,
				ReasonCode.SPAM,
				"신고 테스트 7 - 감사 로그 테스트 신고"
			);
		Member admin = testMember;

		ReportAuditLog auditLog = new ReportAuditLog(
			report,
			admin,
			ReportStatus.PENDING,
			ReportStatus.APPROVED,
			"신고 내용 확인 후 승인",
			-5
		);
		reportAuditLogRepository.saveAndFlush(auditLog);

		List<ReportAuditLog> result =
			reportAuditLogRepository.findByReport_ReportIdOrderByProcessedAtDesc(
				report.getReportId()
			);
		assertThat(result).hasSize(1);

		ReportAuditLog found = result.get(0);

		assertThat(found.getReport().getReportId()).isEqualTo(report.getReportId());
		assertThat(found.getAdminMember().getId()).isEqualTo(testMember.getId());
		assertThat(found.getPreviousStatus()).isEqualTo(ReportStatus.PENDING);
		assertThat(found.getChangedStatus()).isEqualTo(ReportStatus.APPROVED);
		assertThat(found.getProcessReason()).isEqualTo("신고 내용 확인 후 승인");
		assertThat(found.getTrustScoreChange()).isEqualTo(-5);
		assertThat(found.getProcessedAt()).isNotNull();
	}
}

//@Test
//@DisplayName("신고 Repository Bean 생성 테스트")
//void repositoryBeanTest() {
//  assertThat(reportRepository).isNotNull();
//  assertThat(memberReportStatusRepository).isNotNull();
//  assertThat(reportAuditLogRepository).isNotNull();
//}
package com.moit.reports.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.meetup.entity.Meetup;
import com.moit.meetup.repository.MeetupRepository;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberInfo;
import com.moit.member.repository.MemberInfoRepository;
import com.moit.member.repository.MemberRepository;
import com.moit.reports.api.ApiEmail;
import com.moit.reports.dto.EmailRequestDto;
import com.moit.reports.dto.ReportAuditLogDto;
import com.moit.reports.dto.ReportSearchDto;
import com.moit.reports.dto.ReportsDto.ReportListResponseDto;
import com.moit.reports.dto.ReportsDto.ReportProcessDto;
import com.moit.reports.dto.ReportsDto.ReportRequestDto;
import com.moit.reports.dto.ReportsDto.ReportResponseDto;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.entity.Report;
import com.moit.reports.entity.ReportAuditLog;
import com.moit.reports.enums.ReportStatus;
import com.moit.reports.enums.TargetType;
import com.moit.reports.repository.MemberReportStatusRepository;
import com.moit.reports.repository.ReportAuditLogRepository;
import com.moit.reports.repository.ReportRepository;
import com.moit.review.entity.Review;
import com.moit.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

	private final ReportRepository reportRepository;
	private final MemberReportStatusRepository memberReportStatusRepository;
	private final ReportAuditLogRepository reportAuditLogRepository;
	private final ApiEmail apiEmail;

	private final MemberRepository memberRepository;
	private final MemberInfoRepository memberInfoRepository;

	private final MeetupRepository meetupRepository;
	private final ReviewRepository reviewRepository;

	// redis
	private final ReportLockService reportLockService;
	private final SendEmailService sendEmailService;
	private final ApplicationEventPublisher eventPublisher;

	// 사용자 신고 작성
	@Override
	@Transactional
	public ReportResponseDto createUserReport(Long memberId, ReportRequestDto requestDto) {
		Member user = memberRepository.findById(memberId)
				.orElseThrow(() -> new IllegalArgumentException("사용자 신고 작성 오류! 존재하지 않는 사용자! ID: " + memberId));

		// 중복 신고 확인 코드 추가
		boolean doubleCheck = reportRepository.existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn(memberId,
				requestDto.getTargetType(), requestDto.getTargetId(), 'N');

		if (doubleCheck) {
			throw new IllegalArgumentException("이미 신고한 대상입니다.");
		}

		// 신고 글 작성
		Report report = new Report();
		report.setTargetType(requestDto.getTargetType());
		report.setTargetId(requestDto.getTargetId());
		report.setMember(user);
		report.setReasonCode(requestDto.getReasonCode());
		report.setReasonDetail(requestDto.getReasonDetail());
		report.setStatus(ReportStatus.PENDING);
		Report savedReport = reportRepository.saveAndFlush(report);

		return ReportResponseDto.from(savedReport);
	}

	// 사용자 신고 수정
	@Override
	@Transactional
	public ReportResponseDto updateUserReport(Long reportId, Long memberId, ReportRequestDto requestDto) {
		Report report = reportRepository
				.findByReportIdAndMember_IdAndDeleteYnAndStatus(reportId, memberId, 'N', ReportStatus.PENDING)
				.orElseThrow(() -> new IllegalArgumentException("사용자 신고 수정 조회 오류! reportId: " + reportId));

		report.setReasonCode(requestDto.getReasonCode());
		report.setReasonDetail(requestDto.getReasonDetail());
		report.setUserUpdatedAt(LocalDateTime.now());

		return ReportResponseDto.from(report);
	}

	// 사용자 신고 삭제 (논리삭제 update delete_yn = 'Y')
	@Override
	@Transactional
	public void deleteUserReport(Long reportId, Long memberId) {
		Report report = reportRepository
				.findByReportIdAndMember_IdAndDeleteYnAndStatus(reportId, memberId, 'N', ReportStatus.PENDING)
				.orElseThrow(() -> new IllegalArgumentException("사용자 신고 삭제 조회 오류! reportId: " + reportId));

		// 신고 물리삭제
//	    reportRepository.delete(report);
		// 신고 논리삭제
		report.setDeleteYn('Y');
	}

	// 사용자 신고 목록 조회 + 페이징
	@Override
	public ReportListResponseDto getUserReports(Long memberId, Pageable pageable) {
		Pageable pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

		Page<Report> page = reportRepository.findByMember_IdAndDeleteYnOrderByReportIdDesc(memberId, 'N', pageRequest);

		// 조회된 신고 Entity 목록을 ResponseDto 목록으로 변환
		List<ReportResponseDto> response = page.getContent().stream().map(report -> {
			// 1. 신고자 + 신고 기본정보
			ReportResponseDto dto = ReportResponseDto.from(report);
			// 2. 신고 대상 회원 정보 추가
			setTargetMemberInfo(report, dto);

			return dto;
		}).toList();

		ReportListResponseDto responseDto = new ReportListResponseDto();
		responseDto.setReports(response); // 신고 목록
		responseDto.setTotalCount(page.getTotalElements()); // 전체 신고 개수
		responseDto.setTotalPage((long) page.getTotalPages()); // 전체 페이지 수 (20/10 = 2...)

		return responseDto;
	}

	// 사용자 신고 상세 조회
	@Override
	public ReportResponseDto getUserReportDetail(Long reportId, Long memberId) {
		Report report = reportRepository.findByReportIdAndMember_IdAndDeleteYn(reportId, memberId, 'N')
				.orElseThrow(() -> new IllegalArgumentException("사용자 신고 상세 조회 오류! reportId: " + reportId));

		ReportResponseDto responseDto = ReportResponseDto.from(report);

		// 신고당한 회원 정보 추가 !!!
		setTargetMemberInfo(report, responseDto);

		return responseDto;
//		return ReportResponseDto.from(report);
	}

	// 모임, 리뷰 신고 더블 체크 (화면용 중복 체크)
	@Override
	public boolean checkDoubleReport(Long memberId, TargetType targetType, Long targetId) {
		return reportRepository.existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn(memberId, targetType, targetId,
				'N');
	}

	// 관리자 처리 상태 (승인/반려/신뢰도점수/감사로그) 변경
	@Transactional
	@Override
	public ReportResponseDto updateAdminReport(Long reportId, Long memberId, ReportProcessDto processDto) {
		// 처리 사유 공백 막기
		if (processDto.getProcessReason() == null || processDto.getProcessReason().isBlank()) {
			throw new IllegalArgumentException("처리 사유를 입력해주세요.");
		}
		
		// 신고 처리 가능? tryLock
		boolean acquired = reportLockService.tryLock(reportId);

		// 현재 처리중
		if (!acquired) {
			throw new IllegalStateException("현재 처리중");
		}

		try {
			// PEDING 상태 조회
			Report report = getPendingReport(reportId);

			// 상태 변경 - 변경 전
			ReportStatus previousStatus = report.getStatus();
			// 상태 변경 - 변경 후
			ReportStatus changedStatus = processDto.getStatus();

			// APPROVED / REJECTED 검증
			ReportStatus reportStatus = validateChangedStatus(changedStatus);

			// changeStatus 처리 상태 반영
			report.changeStatus(changedStatus);

			// 신뢰도점수
			int trustScoreChange = updateTargetMemberTrustScore(changedStatus, report);

			// 관리자 Member 조회
			Member adminMember = getAdminMember(memberId);

			// 관리자 처리 감사 로그 (상태) 저장
			ReportAuditLog reportAuditLog = ReportAuditLog.statusChanged(report, adminMember, previousStatus,
					changedStatus, processDto.getProcessReason(), trustScoreChange);
			reportAuditLogRepository.save(reportAuditLog);

			// 메일 전송 test - 이메일 보내야 한다는 이벤트만 발생
			EmailRequestDto emailDto = sendEmailService.adminReportStatusSendEmail(report, changedStatus);
			eventPublisher.publishEvent(emailDto);

			ReportResponseDto responseDto = ReportResponseDto.from(report);
			setTargetMemberInfo(report, responseDto);

			return responseDto;

		} finally {
			reportLockService.unlock(reportId);
		}
	}

	// 관리자 신고 삭제 (물리삭제 -> 논리삭제 변경 + 감사 로그 processReason 포함)
	@Override
	@Transactional
	public void deleteAdminReport(Long reportId, Long memberId, String processReason) {
		// 삭제할 신고 조회
		Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new IllegalArgumentException("삭제할 신고를 조회할 수 없습니다."));

		if (processReason == null || processReason.isEmpty()) {
			throw new IllegalArgumentException("삭제 사유를 입력해주세요.");
		}

		// 신고 물리삭제
//	    reportRepository.delete(report);
		// 신고 논리삭제
		report.setDeleteYn('Y');

		// 관리자 Member 조회
		Member adminMember = memberRepository.findById(memberId)
				.orElseThrow(() -> new IllegalArgumentException("관리자 조회 오류! MemberId: " + memberId));

		// 관리자 처리 감사 로그 (삭제) 저장
		ReportAuditLog reportAuditLog = ReportAuditLog.deleted(report, adminMember, processReason);
		reportAuditLogRepository.save(reportAuditLog);

		////////////////////////////////////////////////////////////
		EmailRequestDto emailDto = sendEmailService.adminReportDeleteSendEmail(report);
		eventPublisher.publishEvent(emailDto);
	}

	// 관리자 신고 목록 조회 + 검색 + 페이징
	@Override
	public ReportListResponseDto getAdminReports(ReportSearchDto searchDto, Pageable pageable) {
		Pageable pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

		String memberNickname = null;

		// 작성자 검색
		if (searchDto.getMemberNickname() != null && !searchDto.getMemberNickname().isBlank()) {
			memberNickname = searchDto.getMemberNickname().trim();
		}

		// 삭제 상태 기본값: 정상(N)
		Character deleteYn = searchDto.getDeleteYn();
		if (deleteYn == null) {
			deleteYn = 'N';
		}

		Page<Report> page = reportRepository.findAdminReports(searchDto.getTargetType(), searchDto.getStatus(),
				searchDto.getReasonCode(), // 드롭다운
//				searchDto.getDeleteYn(),
				deleteYn, memberNickname, // 검색어
				pageRequest);

		// 조회된 신고 Entity 목록을 ResponseDto 목록으로 변환
		List<ReportResponseDto> reports = page.getContent().stream().map(report -> {
			// 신고자 + 신고 기본정보
			ReportResponseDto dto = ReportResponseDto.from(report);
			// 신고 대상 회원 정보
			setTargetMemberInfo(report, dto);

			return dto;
		}).toList();

		ReportListResponseDto responseDto = new ReportListResponseDto();
		responseDto.setReports(reports); // 신고 목록
		responseDto.setTotalCount(page.getTotalElements()); // 전체 신고 개수
		responseDto.setTotalPage((long) page.getTotalPages()); // 전체 페이지 수 (20/10 = 2...)

		return responseDto;
	}

	// 관리자 신고 상세 조회
	@Override
	public ReportResponseDto getAdminReportDetail(Long reportId) {
		Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new IllegalArgumentException("관리자 신고 상세 조회 오류! reportId: " + reportId));

		ReportResponseDto responseDto = ReportResponseDto.from(report);

		// 신고당한 회원 정보 추가 !!!
		setTargetMemberInfo(report, responseDto);

		return responseDto;
	}

	// 관리자 통계
	@Override
	public Map<String, Long> getAdminReportStats() {

		long total = reportRepository.countByDeleteYn('N');
		long pending = reportRepository.countByStatusAndDeleteYn(ReportStatus.PENDING, 'N');
		long approved = reportRepository.countByStatusAndDeleteYn(ReportStatus.APPROVED, 'N');
		long rejected = reportRepository.countByStatusAndDeleteYn(ReportStatus.REJECTED, 'N');

		return Map.of(
				"total", total,
				"pending", pending,
				"approved", approved,
				"rejected", rejected
		);
	}

	/////////////////////////////////////////////////////////////////////
	// 관리자 처리 로그 조회
	@Override
	public List<ReportAuditLogDto> getReportAuditLogs(Long reportId) {
		List<ReportAuditLog> reportAuditLogs = reportAuditLogRepository
				.findByReport_ReportIdOrderByProcessedAtDesc(reportId);

		List<ReportAuditLogDto> logs = reportAuditLogs.stream().map(ReportAuditLogDto::from).toList();

		return logs;
	}

	// 신고 처리 3일 후 만족도 조사 이메일 발송 (8월 24일 기준 - 8월 21일 00:00 ~ 23:59:59)
	@Override
	public void sendThreeDaysAgoReportEmails() {

		// 오늘 기준 3일 전 날짜
		LocalDate targetDate = LocalDate.now().minusDays(3);

		// 3일 전 00:00:00
		LocalDateTime start = targetDate.atStartOfDay();
		// 3일 전 23:59:59.999999999
		LocalDateTime end = targetDate.atTime(LocalTime.MAX);

		// 3일 전에 처리된 신고 감사 로그 조회
		List<ReportAuditLog> logs = reportAuditLogRepository.findByProcessedAtBetweenAndThreeDayEmailSentYn(start, end,
				'N');

		for (ReportAuditLog log : logs) {

			Report report = log.getReport();
			String email = report.getMember().getEmail(); // 메일주소 조회

			if (email != null && !email.isEmpty()) {
				String subject = "[만족도 참여] Moit 문의 처리 결과는 어떠셨나요?";
				String content = "Moit 신고 처리 결과는 어떠셨나요?" + "\n\n마음에 드셨다면 만족도 참여에 동참해주세요!" + "\n\n링크첨부...";

				try {
					// 메일 전송 test
					apiEmail.sendMail(subject, content, email);

					// 메일 전송 성공 → 다시 발송되지 않도록 Y 처리
					log.setThreeDayEmailSentYn('Y');

				} catch (Exception e) {
					e.printStackTrace();
				}

			} else {
				System.out.println("이메일이 없습니다. 메일 전송 실패...");
			}
		}

	}
	
	// 관리자 처리 로그 자동 삭제 (3년 전)
	@Override
	@Transactional
	public long deleteAuditLogs() {
		LocalDateTime cutoff = LocalDateTime.now().minusYears(3);
		return reportAuditLogRepository.deleteByProcessedAtBefore(cutoff);
	}
	
	
	

	//////////////////////////////////////////////////////////////////////////////
	// 신고 대상 회원 정보 찾기...
	private void setTargetMemberInfo(Report report, ReportResponseDto responseDto) {

		Member targetMember;

		if (report.getTargetType() == TargetType.MEETUP) {
			Meetup meetup = meetupRepository.findById(report.getTargetId())
					.orElseThrow(() -> new IllegalArgumentException("모임 조회 실패!"));

			targetMember = meetup.getMember();

		} else if (report.getTargetType() == TargetType.REVIEW) {
			Review review = reviewRepository.findById(report.getTargetId())
					.orElseThrow(() -> new IllegalArgumentException("리뷰 조회 실패!"));

			targetMember = review.getMember();

			// 리뷰가 속한 모임 ID
			responseDto.setMeetupId(review.getMeetup().getId());

		} else {
			throw new IllegalArgumentException("잘못된 targetType입니다.");
		}

		// 신고 대상 회원 정보찾기 시작... id & nickname
		responseDto.setTargetMemberId(targetMember.getId());
		responseDto.setTargetMemberNickname(targetMember.getNickname());

		// 신고 대상 회원의... memberInfo 조회
		MemberInfo targetMemberInfo = memberInfoRepository.findById(targetMember.getId())
				.orElseThrow(() -> new IllegalArgumentException("신고 대상 회원 MemberInfo 조회 불가!"));

		// 신고 대상 회원의... 신뢰도
		responseDto.setTargetTrustScore(targetMemberInfo.getTrustScore());

		// 신고 대상 회원의... 뱃지
		if (targetMemberInfo.getMemberReportStatus() != null) {
			responseDto.setTargetStatusCode(targetMemberInfo.getMemberReportStatus().getStatusCode());
			responseDto.setTargetStatusName(targetMemberInfo.getMemberReportStatus().getStatusName());
		}

	}

	//////////////////////////////////////////////////////////////////////////////
	// PEDING 상태 조회
	private Report getPendingReport(Long reportId) {
		return reportRepository.findByReportIdAndStatus(reportId, ReportStatus.PENDING)
				.orElseThrow(() -> new IllegalArgumentException("관리자 신고 처리 조회 오류! reportId: " + reportId));
	}

	// APPROVED / REJECTED 검증
	private ReportStatus validateChangedStatus(ReportStatus changedStatus) {
		if (changedStatus != ReportStatus.APPROVED && changedStatus != ReportStatus.REJECTED) {
			throw new IllegalArgumentException("신고 상태는 APPROVED 또는 REJECTED만 가능합니다.");
		}
		return changedStatus;
	}

	// 신뢰도 점수
	private int updateTargetMemberTrustScore(ReportStatus changedStatus, Report report) {
		if (changedStatus != ReportStatus.APPROVED) {
			return 0;
		}
		// 신뢰도 점수 변경량
		int trustScoreChange = -5;

		// 신고 대상 회원 ID 찾기
		Long targetMemberId = findTargetMemberId(report);

		// 신고 대상 회원 정보 조회
		MemberInfo memberInfo = memberInfoRepository.findById(targetMemberId)
				.orElseThrow(() -> new IllegalArgumentException("신고 대상 회원 MemberInfo 조회 불가!"));

		// 신뢰도 점수 반영
		int currentTrustScore = memberInfo.getTrustScore();
		int changedTrustScore = currentTrustScore + trustScoreChange;

		memberInfo.setTrustScore(changedTrustScore);

		// 뱃지 변경
		String statusCode;

		if (changedTrustScore >= 80) {
			statusCode = "ACTIVE";
		} else if (changedTrustScore >= 40) {
			statusCode = "WARNING";
		} else {
			statusCode = "DANGER";
		}

		MemberReportStatus memberReportStatus = memberReportStatusRepository.findByStatusCode(statusCode)
				.orElseThrow(() -> new IllegalArgumentException("회원 신고 상태 조회 불가!"));

		memberInfo.setMemberReportStatus(memberReportStatus);

		return trustScoreChange;
	}

	// 신고 대상 회원 ID 찾기
	private Long findTargetMemberId(Report report) {
		if (report.getTargetType() == TargetType.MEETUP) {
			Meetup meetup = meetupRepository.findById(report.getTargetId())
					.orElseThrow(() -> new IllegalArgumentException("Meetup 불러오기 실패!"));
			return meetup.getMember().getId();
		}

		if (report.getTargetType() == TargetType.REVIEW) {
			Review review = reviewRepository.findById(report.getTargetId())
					.orElseThrow(() -> new IllegalArgumentException("Review 불러오기 실패!"));
			return review.getMember().getId();
		}

		throw new IllegalArgumentException("MEETUP, REVIEW가 아닌 targetType입니다.");
	}

	// 관리자 Member 조회
	private Member getAdminMember(Long memberId) {
		return memberRepository.findById(memberId)
				.orElseThrow(() -> new IllegalArgumentException("관리자 조회 오류! MemberId: " + memberId));
	}

	

	// 관리자처리이력 - 관리자 처리 감사 로그 (상태) 저장
	// entity.ReportAuditLog 사용
}
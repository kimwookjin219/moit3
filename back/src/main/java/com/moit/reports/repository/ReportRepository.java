package com.moit.reports.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.reports.entity.Report;
import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.ReportStatus;
import com.moit.reports.enums.TargetType;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
	// save() findById() findAll() deleteById() existsById() count()
	
	// 사용자 신고 수정
	Optional<Report> findByReportIdAndMember_IdAndDeleteYnAndStatus(
        Long reportId, Long memberId, Character deleteYn, ReportStatus status
    );
	
	// 사용자 신고 목록 조회 + 페이징
	Page<Report> findByMember_IdAndDeleteYnOrderByReportIdDesc(
        Long memberId, Character deleteYn, Pageable pageable
    );
	
	// 사용자 신고 상세 조회
	Optional<Report> findByReportIdAndMember_IdAndDeleteYn(
        Long reportId, Long memberId, Character deleteYn
    );

	// 중복 신고 확인
	boolean existsByMember_IdAndTargetTypeAndTargetIdAndDeleteYn(
        Long memberId, TargetType targetType, Long targetId, Character deleteYn
    );

	// 관리자 (승인/반려) 처리를 위한 신고 조회
	Optional<Report> findByReportIdAndStatus(Long reportId, ReportStatus status);
	
	// 관리자 신고 목록 조회 + 검색 + 페이징
	@Query ("""
		select r
		from Report r	join r.member m
		where	(:status IS NULL OR r.status = :status)
			and (:deleteYn IS NULL OR r.deleteYn = :deleteYn)
			and (:targetType IS NULL OR r.targetType = :targetType)
			and (:memberNickname IS NULL OR LOWER(m.nickname)
				LIKE LOWER(CONCAT('%', :memberNickname, '%')) )
			and (:reasonCode IS NULL OR r.reasonCode = :reasonCode )
		ORDER BY r.reportId DESC
	""")
	Page<Report> findAdminReports(
			@Param("targetType")		TargetType targetType,
			@Param("status")			ReportStatus status,
			@Param("reasonCode")		ReasonCode reasonCode,
			@Param("deleteYn")			Character deleteYn,
			@Param("memberNickname")	String memberNickname,
			Pageable pageable
	);
	

	// 관리자 통계
	long countByDeleteYn(Character deleteYn);

	long countByStatusAndDeleteYn(ReportStatus status, Character deleteYn);
} 

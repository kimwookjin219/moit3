//package com.moit.member.repository;
//
//import java.util.Optional;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import com.moit.reports.entity.MemberReportStatus;
//
//@Repository
//public interface ReportStatusRepository extends JpaRepository<MemberReportStatus, Long>{
//	
//	// 신고 상태 조회 (ACTIVE, WARNING ....)
//	Optional<MemberReportStatus> findByStatusName(String statusName);
//}

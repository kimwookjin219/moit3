package com.moit.reports.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.moit.reports.entity.MemberReportStatus;

@Repository
public interface MemberReportStatusRepository extends JpaRepository<MemberReportStatus, Long> {
	
	// 상태 코드 조회		// 'ACTIVE' / 'WARNING' / 'SUSPENDED'
	Optional<MemberReportStatus> findByStatusCode( String statusCode );

	// 상태 이름 조회		// '정상'		/ '주의'		/ '정지'
	Optional<MemberReportStatus> findByStatusName( String statusCode );
}

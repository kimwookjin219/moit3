package com.moit.member.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.PointHistory;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    // 회원 포인트 내역 조회
    List<PointHistory> findByMember_IdOrderByCreatedAtDesc(Long memberId);

    // 회원 현재 보유 포인트 조회
    @Query("""
        SELECT COALESCE(SUM(p.pointPm), 0)
        FROM PointHistory p
        WHERE p.member.id = :memberId
    """)
    Integer findCurrentPoint(@Param("memberId") Long memberId);
    
    List<PointHistory> findByMember_IdAndPointReasonAndCreatedAtBetween(
            Long memberId,
            String pointReason,
            LocalDateTime start,
            LocalDateTime end
    );
    
    // 오늘 출석 포인트 지급 여부 확인
    boolean existsByMember_IdAndPointReasonAndCreatedAtBetween(
            Long memberId,
            String pointReason,
            LocalDateTime start,
            LocalDateTime end
    );
}
package com.moit.advertisement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.advertisement.entity.AdvertisementClickLog;
import com.moit.advertisement.enums.AdPosition;

public interface AdvertisementClickLogRepository extends JpaRepository<AdvertisementClickLog, Long> {
	// 로그인 사용자
	boolean existsByAdvertisement_AdIdAndMember_IdAndPositionAndClickedAtAfter(
            Long adId,
            Long memberId,
            com.moit.advertisement.enums.AdPosition position,
            LocalDateTime after
    );
	
	// 비로그인 사용자
	boolean existsByAdvertisement_AdIdAndSessionIdAndPositionAndClickedAtAfter(
            Long adId,
            String sessionId,
            AdPosition position,
            LocalDateTime after
    );
	
	// =========================================================
    // 일일 통계용
    // 광고 + 위치별 클릭수 집계
    // =========================================================
    @Query("""
        select l.advertisement.adId,
               l.position,
               count(l)
        from AdvertisementClickLog l
        where l.clickedAt >= :start
          and l.clickedAt < :end
        group by l.advertisement.adId, l.position
    """)
    List<Object[]> countDailyClicks(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    
    List<AdvertisementClickLog> findByClickedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}
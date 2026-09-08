package com.moit.advertisement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.advertisement.entity.AdvertisementImpressionLog;
import com.moit.advertisement.enums.AdPosition;

public interface AdvertisementImpressionLogRepository 
				extends JpaRepository<AdvertisementImpressionLog, Long> {
	
	boolean existsByAdvertisement_AdIdAndMember_IdAndPositionAndViewedAtAfter(
            Long adId,
            Long memberId,
            AdPosition position,
            LocalDateTime after
    );

	boolean existsByAdvertisement_AdIdAndSessionIdAndPositionAndViewedAtAfter(
			Long adId, 
			String sessionId,
			AdPosition adPosition, 
			LocalDateTime tenMinutesAgo
	);
	
	// =========================================================
    // 일일 통계용
    // 광고 + 위치별 노출수 집계
    // =========================================================
    @Query("""
        select l.advertisement.adId,
               l.position,
               count(l)
        from AdvertisementImpressionLog l
        where l.viewedAt >= :start
          and l.viewedAt < :end
        group by l.advertisement.adId, l.position
    """)
    List<Object[]> countDailyImpressions(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    
    List<AdvertisementImpressionLog> findByViewedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
    
    long countByAdvertisement_AdIdAndViewedAtBetween(
            Long adId,
            LocalDateTime start,
            LocalDateTime end
    );
}

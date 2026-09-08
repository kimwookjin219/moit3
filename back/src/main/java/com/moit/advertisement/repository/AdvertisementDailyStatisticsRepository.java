package com.moit.advertisement.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.advertisement.entity.AdvertisementDailyStatistics;

public interface AdvertisementDailyStatisticsRepository
        extends JpaRepository<AdvertisementDailyStatistics, Long> {
 
	// 특정 기간 일일 통계
    List<AdvertisementDailyStatistics>
    findByStatDateBetweenOrderByStatDateAsc(
            LocalDate startDate,
            LocalDate endDate
    );

    // 광고 + 날짜 + 위치 중복 체크
    boolean existsByAdvertisement_AdIdAndStatDateAndPosition(
            Long adId,
            LocalDate statDate,
            com.moit.advertisement.enums.AdPosition position
    );

    // 최근 7일 통계
    @Query("""
        select s
        from AdvertisementDailyStatistics s
        where s.statDate >= :startDate
        order by s.statDate asc
    """)
    List<AdvertisementDailyStatistics> findRecentStatistics(
            @Param("startDate") LocalDate startDate
    );
    
    @Query("""
	    select coalesce(sum(s.impressions), 0)
	    from AdvertisementDailyStatistics s
	    where s.statDate between :startDate and :endDate
	""")
	Long sumImpressions(
	        @Param("startDate") LocalDate startDate,
	        @Param("endDate") LocalDate endDate
	);

	@Query("""
	    select coalesce(sum(s.clicks), 0)
	    from AdvertisementDailyStatistics s
	    where s.statDate between :startDate and :endDate
	""")
	Long sumClicks(
	        @Param("startDate") LocalDate startDate,
	        @Param("endDate") LocalDate endDate
	);
	
	@Query("""
	    select coalesce(sum(s.impressions), 0)
	    from AdvertisementDailyStatistics s
	    where s.statDate = :statDate
	""")
	Long sumImpressionsByDate(
	        @Param("statDate") LocalDate statDate
	);

	@Query("""
	    select coalesce(sum(s.clicks), 0)
	    from AdvertisementDailyStatistics s
	    where s.statDate = :statDate
	""")
	Long sumClicksByDate(
	        @Param("statDate") LocalDate statDate
	);
}
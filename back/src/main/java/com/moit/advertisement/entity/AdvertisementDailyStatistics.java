package com.moit.advertisement.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.AdStatus;
import com.moit.advertisement.enums.ApprovalStatus;
import com.moit.advertisement.enums.PaymentStatus;
import com.moit.advertisement.enums.PaymentType;
import com.moit.advertisement.enums.TargetGender;
import com.moit.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Table(
    name = "ADVERTISEMENT_DAILY_STATISTICS",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UK_AD_DAILY_STAT",
            columnNames = {"AD_ID", "STAT_DATE", "POSITION"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdvertisementDailyStatistics {

    // 광고 일일 통계 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_daily_statistics_seq"
    )
    @SequenceGenerator(
        name = "advertisement_daily_statistics_seq",
        sequenceName = "ADVERTISEMENT_DAILY_STATISTICS_SEQ",
        allocationSize = 1
    )
    @Column(name = "STAT_ID")
    private Long statId;


    // 통계를 집계한 광고
    // 하나의 광고는 날짜별로 여러 통계 데이터를 가질 수 있음
    @ManyToOne
    @JoinColumn(name = "AD_ID", nullable = false)
    private Advertisement advertisement;


    // 통계 집계 날짜
    // 예) 2026-08-03
    @Column(name = "STAT_DATE", nullable = false)
    private LocalDate statDate;


    // 해당 날짜의 광고 노출 수
    @Column(name = "IMPRESSIONS", nullable = false)
    private Long impressions;


    // 해당 날짜의 광고 클릭 수
    @Column(name = "CLICKS", nullable = false)
    private Long clicks;


    // 클릭률(CTR)
    // (클릭 수 / 노출 수) * 100
    @Column(
        name = "CTR",
        precision = 6,
        scale = 2,
        nullable = false
    )
    private BigDecimal ctr;


    // 광고 피로도 점수
    // 반복 노출량 등을 기준으로 계산
    @Column(
        name = "FATIGUE_SCORE",
        precision = 5,
        scale = 2,
        nullable = false
    )
    private BigDecimal fatigueScore;


    // 통계 생성일시
    // 배치 또는 Scheduler가 통계를 생성한 시간
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;


    // 광고가 노출된 위치
    // MAIN / MEETUP_LIST_BANNER /
    // MEETUP_LIST_SIDEBAR / MEETUP_DETAIL_SIDEBAR
    @Enumerated(EnumType.STRING)
    @Column(name = "POSITION", length = 30, nullable = false)
    private AdPosition position;


    // Entity 최초 저장 시 기본값 설정
    @PrePersist
    void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (this.statDate == null) {
            this.statDate = LocalDate.now();
        }

        if (this.impressions == null) {
            this.impressions = 0L;
        }

        if (this.clicks == null) {
            this.clicks = 0L;
        }

        if (this.ctr == null) {
            this.ctr = BigDecimal.ZERO;
        }

        if (this.fatigueScore == null) {
            this.fatigueScore = BigDecimal.ZERO;
        }

        this.createdAt = now;
    }
}
package com.moit.advertisement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Table(name = "ADVERTISEMENT_AI_SUMMARY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdvertisementAiSummary {

    // AI 통계 요약 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_ai_summary_seq"
    )
    @SequenceGenerator(
        name = "advertisement_ai_summary_seq",
        sequenceName = "ADVERTISEMENT_AI_SUMMARY_SEQ",
        allocationSize = 1
    )
    @Column(name = "SUMMARY_ID")
    private Long summaryId;


    // AI가 생성한 광고 통계 분석 결과
    // 전체 광고의 노출수, 클릭수, CTR, 피로도 등의 분석 내용
    @Lob
    @Column(name = "SUMMARY", nullable = false)
    private String summary;


    // AI 분석 결과 생성일시
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;


    // Entity 최초 저장 시 생성일시 자동 설정
    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
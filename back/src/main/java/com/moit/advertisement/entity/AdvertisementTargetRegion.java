package com.moit.advertisement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADVERTISEMENT_TARGET_REGION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdvertisementTargetRegion {

    // 광고 타겟 지역 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_target_region_seq"
    )
    @SequenceGenerator(
        name = "advertisement_target_region_seq",
        sequenceName = "ADVERTISEMENT_TARGET_REGION_SEQ",
        allocationSize = 1
    )
    @Column(name = "TARGET_REGION_ID")
    private Long targetRegionId;


    // 타겟 지역을 설정한 광고
    // 하나의 광고는 여러 지역을 타겟으로 설정할 수 있음
    // 예) 서울 + 경기 + 인천
    @ManyToOne
    @JoinColumn(name = "AD_ID", nullable = false)
    private Advertisement advertisement;


    // 지역 코드
    // 예) SEOUL / GYEONGGI / INCHEON
    // 또는 공공데이터/지도 API에서 사용하는 지역 코드
    @Column(name = "REGION_CODE", length = 50, nullable = false)
    private String regionCode;


    // 타겟 지역 등록일시
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;


    // Entity 최초 저장 시 등록일시 자동 생성
    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
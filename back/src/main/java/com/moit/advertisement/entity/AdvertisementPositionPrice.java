package com.moit.advertisement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdPosition;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ADVERTISEMENT_POSITION_PRICE")
@Getter @Setter
public class AdvertisementPositionPrice {

    // 광고 위치 추가요금 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_position_price_seq"
    )
    @SequenceGenerator(
        name = "advertisement_position_price_seq",
        sequenceName = "ADVERTISEMENT_POSITION_PRICE_SEQ",
        allocationSize = 1
    )
    @Column(name = "POSITION_PRICE_ID")
    private Long positionPriceId;


    // 광고 게시 위치
    // MAIN / MEETUP_LIST_BANNER /
    // MEETUP_LIST_SIDEBAR / MEETUP_DETAIL_SIDEBAR
    @Enumerated(EnumType.STRING)
    @Column(name = "POSITION", length = 30, nullable = false)
    private AdPosition position;


    // 해당 위치에 추가되는 금액
    @Column(
        name = "ADDITIONAL_PRICE",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal additionalPrice;


    // 가격 설정 생성일시
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;


    // 가격 설정 수정일시
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;


    // Entity 최초 저장 시 생성일시 설정
    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;
    }


    // Entity 수정 시 수정일시 자동 변경
    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
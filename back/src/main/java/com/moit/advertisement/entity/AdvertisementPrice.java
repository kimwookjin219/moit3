package com.moit.advertisement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.PaymentType;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "ADVERTISEMENT_PRICE",
    uniqueConstraints = {
		@UniqueConstraint(
		    name = "UK_AD_PRICE_GRADE_PERIOD_TYPE",
		    columnNames = {
	    		"PAYMENT_TYPE",
                "AD_GRADE",
                "PERIOD_DAYS"
		    }
		)
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdvertisementPrice {

    // 광고 기본요금 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_price_seq"
    )
    @SequenceGenerator(
        name = "advertisement_price_seq",
        sequenceName = "ADVERTISEMENT_PRICE_SEQ",
        allocationSize = 1
    )
    @Column(name = "PRICE_ID")
    private Long priceId;

    // 결제 타입(등록/연장)
    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_TYPE", length = 20, nullable = false)
    private PaymentType paymentType;

    // 광고 등급
    // GENERAL / PREMIUM
    @Enumerated(EnumType.STRING)
    @Column(name = "AD_GRADE", length = 20, nullable = false)
    private AdGrade adGrade;


    // 광고 게시 기간
    // 1 / 5 / 15 / 30 / 60 / 90일
    @Column(name = "PERIOD_DAYS", nullable = false)
    private Integer periodDays;


    // 해당 등급과 기간의 기본 광고 금액
    @Column(
        name = "BASE_PRICE",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal basePrice;


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
    
    public AdvertisementPrice(
            PaymentType paymentType,
            AdGrade adGrade,
            Integer periodDays,
            BigDecimal basePrice) {

        this.paymentType = paymentType;
        this.adGrade = adGrade;
        this.periodDays = periodDays;
        this.basePrice = basePrice;
    }
    
    public void update(
            PaymentType paymentType,
            AdGrade adGrade,
            Integer periodDays,
            BigDecimal basePrice) {

        this.paymentType = paymentType;
        this.adGrade = adGrade;
        this.periodDays = periodDays;
        this.basePrice = basePrice;
    }
    
    public static AdvertisementPrice create(
            AdGrade adGrade,
            Integer periodDays,
            PaymentType paymentType,
            BigDecimal basePrice) {

        AdvertisementPrice price = new AdvertisementPrice();

        price.adGrade = adGrade;
        price.periodDays = periodDays;
        price.paymentType = paymentType;
        price.basePrice = basePrice;

        return price;
    }
}
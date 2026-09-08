package com.moit.advertisement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.PaymentHistoryStatus;
import com.moit.advertisement.enums.PaymentType;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADVERTISEMENT_PAYMENT")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdvertisementPayment {

    // 결제 이력 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_payment_seq"
    )
    @SequenceGenerator(
        name = "advertisement_payment_seq",
        sequenceName = "ADVERTISEMENT_PAYMENT_SEQ",
        allocationSize = 1
    )
    @Column(name = "PAYMENT_ID")
    private Long paymentId;


    // 결제 대상 광고
    // 하나의 광고는 여러 번 결제할 수 있음
    // (최초 결제 + 연장 결제)
    @ManyToOne
    @JoinColumn(name = "AD_ID", nullable = false)
    private Advertisement advertisement;


    // 결제한 광고주 회원
    // Member Entity 완성 후 연관관계 연결
    @ManyToOne
    @JoinColumn(name = "ADVERTISER_ID", nullable = false)
    private Member advertiser;
    


    // 결제 유형
    // INITIAL = 최초 결제
    // EXTENSION = 연장 결제
    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_TYPE", length = 20, nullable = false)
    private PaymentType paymentType;


    // PG 주문번호
    // Toss 결제 요청 시 생성되는 주문번호
    @Column(
        name = "ORDER_ID",
        length = 100,
        nullable = false,
        unique = true
    )
    private String orderId;


    // Toss에서 발급하는 결제 키
    // 결제 승인 완료 후 저장
    @Column(name = "PAYMENT_KEY", length = 200)
    private String paymentKey;


    // 광고 등급 및 기간에 따른 기본 광고 요금
    // 예) 일반 30일 = 250,000원
    @Column(
        name = "BASE_AMOUNT",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal baseAmount;


    // 광고 게시 위치에 따른 추가 요금
    // 예) 모집목록 배너 = +10,000원
    @Column(
        name = "POSITION_AMOUNT",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal positionAmount;


    // 최종 결제 금액
    // 기본요금 + 위치 추가요금
    @Column(
        name = "AMOUNT",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal amount;
    
	 // 결제 당시 광고 게시 위치
	 // 가격 변경 이후에도 과거 결제 내역에서 확인할 수 있도록 저장
	 // MAIN / MEETUP_LIST_BANNER / MEETUP_LIST_SIDEBAR / MEETUP_DETAIL_SIDEBAR
	 @Enumerated(EnumType.STRING)
	 @Column(name = "POSITION", length = 30)
	 private AdPosition position;


    // 결제 상태
    // REQUESTED = 결제 요청
    // PAID = 결제 완료
    // FAILED = 결제 실패
    // CANCELLED = 결제 취소
    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_STATUS", length = 20, nullable = false)
    private PaymentHistoryStatus paymentStatus;


    // 결제 수단
    // 카드 / 간편결제 등
    @Column(name = "PAYMENT_METHOD", length = 30)
    private String paymentMethod;


    // 결제 요청 일시
    @Column(name = "REQUESTED_AT", nullable = false)
    private LocalDateTime requestedAt;


    // 결제 완료 일시
    @Column(name = "PAID_AT")
    private LocalDateTime paidAt;


    // 결제 취소 일시
    @Column(name = "CANCELLED_AT")
    private LocalDateTime cancelledAt;


    // 결제 취소 사유
    @Column(name = "CANCEL_REASON", length = 500)
    private String cancelReason;


    // 결제한 광고 기간
    // 예) 15일 / 30일 / 60일 / 90일
    @Column(name = "PERIOD_DAYS")
    private Integer periodDays;


    // 결제 적용 시작일시
    @Column(name = "START_DATETIME")
    private LocalDateTime startDatetime;


    // 결제 적용 종료일시
    @Column(name = "END_DATETIME")
    private LocalDateTime endDatetime;


    // 결제 이력 생성일시
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;


    // 결제 이력 수정일시
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;


    // Entity 최초 저장 시 기본값 설정
    @PrePersist
    void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        // 결제 요청일시가 지정되지 않은 경우
        if (this.requestedAt == null) {
            this.requestedAt = now;
        }

        // 결제 상태 기본값
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentHistoryStatus.REQUESTED;
        }

        // 금액 기본값
        if (this.baseAmount == null) {
            this.baseAmount = BigDecimal.ZERO;
        }

        if (this.positionAmount == null) {
            this.positionAmount = BigDecimal.ZERO;
        }

        if (this.amount == null) {
            this.amount = BigDecimal.ZERO;
        }
    }


    // Entity 수정 시 수정일시 자동 갱신
    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // 결제 성공 시 상태 변경 메서드 추가
    public void updatePaymentSuccess(String paymentKey, String paymentMethod) {
        this.paymentStatus = PaymentHistoryStatus.PAID;
        this.paymentKey = paymentKey;
        this.paymentMethod = paymentMethod;
        this.paidAt = LocalDateTime.now();
    }
    
    public void updateAmount(
            BigDecimal baseAmount,
            BigDecimal positionAmount,
            BigDecimal amount) {

        this.baseAmount = baseAmount;
        this.positionAmount = positionAmount;
        this.amount = amount;
    }
    
    public void updatePeriod(
            int periodDays,
            LocalDateTime startDatetime,
            LocalDateTime endDatetime) {

        this.periodDays = periodDays;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
    }
}
package com.moit.advertisement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdStatus;
import com.moit.advertisement.enums.ApprovalStatus;
import com.moit.advertisement.enums.PaymentStatus;
import com.moit.advertisement.enums.PaymentType;
import com.moit.advertisement.enums.TargetGender;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADVERTISEMENTS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Advertisement extends BaseEntity{

    // 광고 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_seq"
    )
    @SequenceGenerator(
	    name = "advertisement_seq",
	    sequenceName = "SEQ_ADVERTISEMENTS",
	    allocationSize = 1
	)
    @Column(name = "AD_ID")
    private Long adId;


    // 광고 제목
    @Column(name = "TITLE", length = 100, nullable = false)
    private String title;


    // 광고 내용
    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;


    // 광고 클릭 시 이동할 랜딩 URL
    @Column(name = "LANDING_URL", length = 500, nullable = false)
    private String landingUrl;


    // 타겟 최소 연령
    @Column(name = "TARGET_AGE_MIN")
    private Integer targetAgeMin;


    // 타겟 최대 연령
    @Column(name = "TARGET_AGE_MAX")
    private Integer targetAgeMax;


    // 타겟 성별
    // MALE / FEMALE / ALL
    @Enumerated(EnumType.STRING)
    @Column(name = "TARGET_GENDER", length = 10, nullable = false)
    private TargetGender targetGender;


    // 광고 게시 시작일시
    @Column(name = "START_DATETIME", nullable = false)
    private LocalDateTime startDatetime;


    // 광고 게시 종료일시
    @Column(name = "END_DATETIME", nullable = false)
    private LocalDateTime endDatetime;


    // 광고 노출 상태
    // PENDING / OPEN / CLOSED
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20, nullable = false)
    private AdStatus status;


    // 광고 신청 승인 상태
    // WAITING / APPROVED / REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "APPROVAL_STATUS", length = 20, nullable = false)
    private ApprovalStatus approvalStatus;

    // 승인한 관리자 회원 PK
    // Member Entity 완성 후 @ManyToOne으로 변경
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "APPROVED_BY")
    private Member approvedBy;
    


    // 광고 승인 일시
    @Column(name = "APPROVED_AT")
    private LocalDateTime approvedAt;


    // 상태를 변경한 관리자 회원 PK
    // Member Entity 완성 후 @ManyToOne으로 변경
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS_UPDATED_BY")
    private Member statusUpdatedBy;
    


    // 광고 반려 사유
    @Lob
    @Column(name = "REJECT_REASON")
    private String rejectReason;


    // 누적 광고 노출 수
    @Column(name = "IMPRESSIONS", nullable = false)
    private Long impressions;


    // 누적 광고 클릭 수
    @Column(name = "CLICKS", nullable = false)
    private Long clicks;


    // 광고 노출 우선순위
    @Column(name = "PRIORITY_SCORE", nullable = false)
    private Integer priorityScore;


    // 광고 피로도 점수
    @Column(
        name = "FATIGUE_SCORE",
        precision = 5,
        scale = 2,
        nullable = false
    )
    private BigDecimal fatigueScore;


    // 광고 종료 30일 전 알림 발송 여부
    // Y = 발송 / N = 미발송
    @Column(name = "REMINDER_30D_SENT", length = 1, nullable = false)
    private String reminder30dSent;


    // 광고 종료 14일 전 알림 발송 여부
    // Y = 발송 / N = 미발송
    @Column(name = "REMINDER_14D_SENT", length = 1, nullable = false)
    private String reminder14dSent;
    
    public void markReminder30dSent() {
        this.reminder30dSent = "Y";
    }

    public void markReminder14dSent() {
        this.reminder14dSent = "Y";
    }

    // 기본 광고비
    @Column(name = "BASE_PRICE", precision = 12, scale = 2)
    private BigDecimal basePrice;

    // 위치 추가금
    @Column(name = "POSITION_PRICE", precision = 12, scale = 2)
    private BigDecimal positionPrice;

    // 광고 총 예산
    @Column(name = "TOTAL_BUDGET", precision = 12, scale = 2)
    private BigDecimal totalBudget;


    // 광고 신청자(제휴업체) 회원 PK
    // Member Entity 완성 후 @ManyToOne으로 변경
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ADVERTISER_ID", nullable = false)
    private Member advertiser;
    

    // 광고 결제 상태
    // NONE / WAITING / PAID
    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_STATUS", length = 20, nullable = false)
    private PaymentStatus paymentStatus;

	 // 현재 대기 중인 결제 유형
	 // INITIAL = 최초 결제 대기
	 // EXTENSION = 연장 결제 대기
	 @Enumerated(EnumType.STRING)
	 @Column(name = "PENDING_PAYMENT_TYPE", length = 20)
	 private PaymentType pendingPaymentType;
    

    // 광고 등급
    // GENERAL / PREMIUM
    @Enumerated(EnumType.STRING)
    @Column(name = "AD_GRADE", length = 20, nullable = false)
    private AdGrade adGrade;


    // Entity 최초 저장 시 기본값 설정
    @PrePersist
    void onCreate() {

        // 광고 상태 기본값
        if (this.status == null) {
            this.status = AdStatus.PENDING;
        }

        // 승인 상태 기본값
        if (this.approvalStatus == null) {
            this.approvalStatus = ApprovalStatus.WAITING;
        }

        // 결제 상태 기본값
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.NONE;
        }

        // 광고 등급 기본값
        if (this.adGrade == null) {
            this.adGrade = AdGrade.GENERAL;
        }

        // 누적 노출 수 기본값
        if (this.impressions == null) {
            this.impressions = 0L;
        }

        // 누적 클릭 수 기본값
        if (this.clicks == null) {
            this.clicks = 0L;
        }

        // 광고 우선순위 기본값
        if (this.priorityScore == null) {
            this.priorityScore = 5;
        }
        
        // 타겟 성별 기본값
        if (this.targetGender == null) {
            this.targetGender = TargetGender.ALL;
        }

        // 광고 피로도 기본값
        if (this.fatigueScore == null) {
            this.fatigueScore = BigDecimal.ZERO;
        }

        // 30일 전 알림 기본값
        if (this.reminder30dSent == null) {
            this.reminder30dSent = "N";
        }

        // 14일 전 알림 기본값
        if (this.reminder14dSent == null) {
            this.reminder14dSent = "N";
        }

    }
    
    public void approve(Member admin) {
        this.approvalStatus = ApprovalStatus.APPROVED;

        // 승인됐지만 아직 광고를 운영하지 않음
        this.status = AdStatus.PENDING;

        // 결제 대기
        this.paymentStatus = PaymentStatus.WAITING;

        // 최초 결제
        this.pendingPaymentType = PaymentType.INITIAL;

        this.approvedBy = admin;
        this.approvedAt = LocalDateTime.now();

        this.rejectReason = null;
    }
    
	 // =========================================================
	 // 광고 수정
	 // =========================================================
    public void updateAdvertisement(
            String title,
            String content,
            String landingUrl,
            Integer targetAgeMin,
            Integer targetAgeMax,
            TargetGender targetGender,
            AdGrade adGrade,
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            BigDecimal totalBudget) {

        this.title = title;
        this.content = content;
        this.landingUrl = landingUrl;

        this.targetAgeMin = targetAgeMin;
        this.targetAgeMax = targetAgeMax;
        this.targetGender = targetGender;

        this.adGrade = adGrade;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;

        this.totalBudget = totalBudget;
    }
    
    public void updatePrice(
            BigDecimal basePrice,
            BigDecimal positionPrice,
            BigDecimal totalBudget) {

        this.basePrice = basePrice;
        this.positionPrice = positionPrice;
        this.totalBudget = totalBudget;
    }


    public void changeStatus(AdStatus status) {
        this.status = status;
    }


    public void changeGrade(AdGrade adGrade) {
        this.adGrade = adGrade;
    }


    public void changePeriod(
            LocalDateTime start,
            LocalDateTime end) {

        this.startDatetime = start;
        this.endDatetime = end;
    }
    
    // 등록 결제 대기
    public void waitForInitialPayment() {
        this.paymentStatus = PaymentStatus.WAITING;
        this.pendingPaymentType = PaymentType.INITIAL;
    }

    // 등록 결제 완료
    public void completeInitialPayment() {
        this.paymentStatus = PaymentStatus.PAID;
        this.pendingPaymentType = null;
    }
    
    // 연장 결제 대기
    public void waitForExtensionPayment() {
        this.paymentStatus = PaymentStatus.WAITING;
        this.pendingPaymentType = PaymentType.EXTENSION;
    }
    
    // 연장 결제 완료
    public void completeExtensionPayment() {
        this.paymentStatus = PaymentStatus.PAID;
        this.pendingPaymentType = null;
    }
    
    // 기간 연장
    public void extendEndDatetime(int periodDays) {
        this.endDatetime = this.endDatetime.plusDays(periodDays);
    }
    
    public void reject(String rejectReason) {

        this.approvalStatus =
                ApprovalStatus.REJECTED;

        this.rejectReason =
                rejectReason;
    }
    
    public void delete() {
        this.setDeleteYn('Y');
    }
    
    // 광고 수정 시 승인 상태를 다시 대기로 변경
    public void resetApprovalStatusForUpdate() {
        this.approvalStatus = ApprovalStatus.WAITING;
        this.rejectReason = null; // 수정했으므로 기존 반려 사유 초기화
    }
    
    public void updateTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public void updatePriorityScore(Integer priorityScore) {
        this.priorityScore = priorityScore;
    }
    
    public void increaseClicks() {
        if (this.clicks == null) {
            this.clicks = 0L;
        }

        this.clicks++;
    }
    
    public void increaseImpressions() {
        if (this.impressions == null) {
            this.impressions = 0L;
        }

        this.impressions++;
    }
}
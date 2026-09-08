package com.moit.advertisement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import com.moit.advertisement.entity.Advertisement;
import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.AdStatus;
import com.moit.advertisement.enums.ApprovalStatus;
import com.moit.advertisement.enums.PaymentHistoryStatus;
import com.moit.advertisement.enums.PaymentStatus;
import com.moit.advertisement.enums.PaymentType;
import com.moit.advertisement.enums.TargetGender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementDto {

    private Long adId;

    private Long advertiserId;
    private String advertiserNickname;

    private String title;
    private String content;
    private String landingUrl;

    private Integer targetAgeMin;
    private Integer targetAgeMax;
    private TargetGender targetGender;

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    private AdStatus status;
    private ApprovalStatus approvalStatus;
    private PaymentStatus paymentStatus;
    private AdGrade adGrade;
    private PaymentType pendingPaymentType;
    
    private String rejectReason;

    private Long impressions;
    private Long clicks;

    private Integer priorityScore;

    private BigDecimal totalBudget;
    
    // 가격 계산 상세
    private Integer totalDays;
    private BigDecimal basePrice;
    private BigDecimal positionPrice;
    private BigDecimal calculatedAmount;
    
    // 결제 정보
    private PaymentType paymentType;
    private PaymentHistoryStatus paymentHistoryStatus;
    private BigDecimal paymentAmount;
    private LocalDateTime paidAt;
    
    // 추가할 필드들
    private String orderId;
    private String paymentKey;
    private String paymentMethod;
    private BigDecimal baseAmount;
    private BigDecimal positionAmount;
    private LocalDateTime cancelledAt;
    private String cancelReason;

    private BigDecimal fatigueScore;

    private String reminder30dSent;
    private String reminder14dSent;

    private Character deleteYn;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 광고 이미지 목록
    private List<AdvertisementImageDto> imageList;


    // =========================================================
    // 광고 등록 요청
    // =========================================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisementRequestDto {

        private String title;
        private String content;
        private String landingUrl;

        private Integer targetAgeMin;
        private Integer targetAgeMax;
        private TargetGender targetGender;
        
        private AdGrade adGrade;
        private PaymentType paymentType;

        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime startDatetime;
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime endDatetime;

        // ==========================================
        // 가격 정보
        // ==========================================
        private BigDecimal basePrice;
        private BigDecimal positionPrice;
        private BigDecimal totalBudget;

        
        private List<AdPosition> positions;
    }
    
    // =========================================================
    //  광고 수정 요청
    // =========================================================
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisementUpdateRequestDto {

        private String title;
        private String content;
        private String landingUrl;

        private Integer targetAgeMin;
        private Integer targetAgeMax;
        private TargetGender targetGender;
        
        private AdGrade adGrade;

        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime startDatetime;
        
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime endDatetime;

        // 서버에서 현재 가격표 기준으로 다시 계산
        private BigDecimal basePrice;
        private BigDecimal positionPrice;
        private BigDecimal totalBudget;

        // 광고가 실제 사용하는 전체 위치
        private List<AdPosition> positions;
    }


    // =========================================================
    // 관리자 광고 업데이트 요청
    // =========================================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisementAdminUpdateDto {

        private Long adId;

        private String status;
        private String approvalStatus;
        private String adGrade;

        private Long approvedBy;
        private LocalDateTime approvedAt;

        private String rejectReason;

        private Long statusUpdatedBy;
        private LocalDateTime statusUpdatedAt;
    }


    // =========================================================
    // 광고 조회 응답
    // =========================================================

    @Getter
    @Builder
    public static class AdvertisementResponseDto {

        private Long adId;

        private String title;
        private String content;
        private String landingUrl;

        private Integer targetAgeMin;
        private Integer targetAgeMax;
        private TargetGender targetGender;

        private LocalDateTime startDatetime;
        private LocalDateTime endDatetime;

        private AdStatus status;
        private ApprovalStatus approvalStatus;
        private PaymentType pendingPaymentType;
        private PaymentStatus paymentStatus;
        private AdGrade adGrade;

        private Long advertiserId;

        private Long impressions;
        private Long clicks;

        private Integer priorityScore;

        private BigDecimal totalBudget;
        
        // ==========================================
        // 가격 계산 정보
        // ==========================================
        private Integer totalDays;
        private BigDecimal basePrice;
        private BigDecimal positionPrice;
        private BigDecimal calculatedAmount;

        private BigDecimal fatigueScore;

        private String reminder30dSent;
        private String reminder14dSent;

        private Character deleteYn;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        
     // 프론트엔드 화면 표출을 위해 추가할 필드들
        private String advertiserNickname; // 광고주 닉네임
        
        // 결제 관련 추가
        private String paymentType;        // 프론트가 찾는 이름
        private BigDecimal amount;         // 실 결제 금액
        private LocalDateTime paymentAt;   // 결제일


        public static AdvertisementResponseDto fromEntity(
                Advertisement ad
        ) {

        	// 💡 1. 닉네임 추출 (Member 엔티티에 닉네임 필드가 있다고 가정)
            String nickname = null;
            if (ad.getAdvertiser() != null) {
                nickname = ad.getAdvertiser().getNickname(); // Member 엔티티의 닉네임 Getter
            }
            
            return AdvertisementResponseDto.builder()
                    .adId(ad.getAdId())
                    .title(ad.getTitle())
                    .content(ad.getContent())
                    .landingUrl(ad.getLandingUrl())

                    .targetAgeMin(ad.getTargetAgeMin())
                    .targetAgeMax(ad.getTargetAgeMax())
                    .targetGender(ad.getTargetGender())

                    .startDatetime(ad.getStartDatetime())
                    .endDatetime(ad.getEndDatetime())

                    .status(ad.getStatus())
                    .approvalStatus(ad.getApprovalStatus())
                    .paymentStatus(ad.getPaymentStatus())
                    .pendingPaymentType(ad.getPendingPaymentType())
                    .adGrade(ad.getAdGrade())

                    .advertiserId(
                            ad.getAdvertiser() != null
                                    ? ad.getAdvertiser().getId()
                                    : null
                    )

                    .impressions(ad.getImpressions())
                    .clicks(ad.getClicks())
                    .priorityScore(ad.getPriorityScore())

                    .totalBudget(ad.getTotalBudget())                    
                    
                    .fatigueScore(ad.getFatigueScore())

                    .reminder30dSent(ad.getReminder30dSent())
                    .reminder14dSent(ad.getReminder14dSent())

                    .deleteYn(ad.getDeleteYn())

                    .createdAt(ad.getCreatedAt())
                    .updatedAt(ad.getUpdatedAt())
                    
                    .advertiserNickname(nickname)
                    
                    .paymentType(ad.getPendingPaymentType() != null ? ad.getPendingPaymentType().name() : null)
                    .amount(ad.getTotalBudget()) // 일단 예산을 결제금액 쪽에 맵핑
                    // .paymentAt(...) // 결제일은 Payment 엔티티를 조회해야 하므로, 우선 제외

                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisementPageResponseDto {

        private List<AdvertisementDto> list;
        private int totalCnt;
        private int totalPage;
        private int page;
        private int size;

        public AdvertisementPageResponseDto(
                List<AdvertisementDto> list,
                int totalCnt,
                int page,
                int size) {

            this.list = list;
            this.totalCnt = totalCnt;
            this.page = page;
            this.size = size;

            this.totalPage =
                    (int) Math.ceil((double) totalCnt / size);
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvertisementPaymentPageResponseDto {

        private List<AdvertisementPaymentDto> list;
        private int totalCnt;
        private int totalPage;
        private int page;
        private int size;

        public AdvertisementPaymentPageResponseDto(
                List<AdvertisementPaymentDto> list,
                int totalCnt,
                int page,
                int size) {

            this.list = list;
            this.totalCnt = totalCnt;
            this.page = page;
            this.size = size;

            this.totalPage =
                    (int) Math.ceil((double) totalCnt / size);
        }
    }
}
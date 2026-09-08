package com.moit.advertisement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.moit.advertisement.entity.AdvertisementPayment;
import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.PaymentHistoryStatus;
import com.moit.advertisement.enums.PaymentType;

import lombok.Data;

@Data
public class AdvertisementPaymentDto {

    private Long paymentId;

    private Long adId;
    private String adTitle;

    private Long advertiserId;
    
    private String advertiserNickname;
    private String advertiserEmail;
    private AdGrade adGrade;

    private PaymentType paymentType;

    private String orderId;
    private String paymentKey;

    private BigDecimal baseAmount;
    private BigDecimal positionAmount;
    private BigDecimal amount;

    private AdPosition position;

    private PaymentHistoryStatus paymentStatus;

    private String paymentMethod;

    private LocalDateTime requestedAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;

    private String cancelReason;

    private Integer periodDays;

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    private LocalDateTime createdAt;
    
    public static AdvertisementPaymentDto from(
            AdvertisementPayment payment) {

        AdvertisementPaymentDto dto =
                new AdvertisementPaymentDto();

        dto.setPaymentId(payment.getPaymentId());

        if (payment.getAdvertisement() != null) {
            dto.setAdId( payment.getAdvertisement().getAdId() );  
            dto.setAdTitle( payment.getAdvertisement().getTitle() );  
            dto.setStartDatetime( payment.getAdvertisement().getStartDatetime() );
            dto.setEndDatetime( payment.getAdvertisement().getEndDatetime() ); 
        }  
        
        if (payment.getAdvertiser() != null) {  
        	dto.setAdvertiserId( payment.getAdvertiser().getId() );  
            dto.setAdvertiserNickname( payment.getAdvertiser().getNickname() );
            dto.setAdvertiserEmail(payment.getAdvertiser().getEmail());
        }

        dto.setPaymentType( payment.getPaymentType() );  
        dto.setOrderId( payment.getOrderId() ); 
        dto.setPaymentKey( payment.getPaymentKey() );

        dto.setBaseAmount( payment.getBaseAmount() );  
        dto.setPositionAmount( payment.getPositionAmount() );  
        dto.setAmount( payment.getAmount() );

        dto.setPosition( payment.getPosition() ); 
        
        dto.setPaymentStatus( payment.getPaymentStatus() );  
        dto.setPaymentMethod( payment.getPaymentMethod() );  
        dto.setRequestedAt( payment.getRequestedAt() );

        dto.setPaidAt( payment.getPaidAt() );  
        dto.setCancelledAt( payment.getCancelledAt() ); 
        dto.setCancelReason( payment.getCancelReason() );  
        dto.setPeriodDays( payment.getPeriodDays() );

        dto.setStartDatetime( payment.getStartDatetime() );  
        dto.setEndDatetime( payment.getEndDatetime() );  
        dto.setCreatedAt( payment.getCreatedAt() );

        return dto;
    }
}
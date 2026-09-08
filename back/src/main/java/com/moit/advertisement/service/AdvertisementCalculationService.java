package com.moit.advertisement.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.moit.advertisement.dto.AdvertisementCalculationResultDto;
import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.PaymentType;

public interface AdvertisementCalculationService {

    /**
     * 최종 광고 결제 금액을 계산합니다.
     */
    BigDecimal calculateTotalAmount(
            LocalDateTime startDatetime, 
            LocalDateTime endDatetime, 
            AdGrade adGrade, 
            PaymentType paymentType, 
            List<AdPosition> positions
    );
    
    AdvertisementCalculationResultDto calculate(
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            AdGrade adGrade,
            PaymentType paymentType,
            List<AdPosition> positions
    );
    
    int calculateTotalDays(
            LocalDateTime startDatetime,
            LocalDateTime endDatetime
    );
}
package com.moit.advertisement.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdvertisementCalculationResultDto {

    // 광고 기간
    private int totalDays;

    // 기간 + 등급에 따른 기본 광고비
    private BigDecimal basePrice;

    // 광고 위치 추가금
    private BigDecimal positionPrice;

    // 최종 광고비
    private BigDecimal totalAmount;
}
package com.moit.advertisement.dto;

import java.math.BigDecimal;

import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.PaymentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementPriceDto {

    private Long priceId;

    private AdGrade adGrade;

    private Integer periodDays;

    private PaymentType paymentType;

    private BigDecimal basePrice;
}
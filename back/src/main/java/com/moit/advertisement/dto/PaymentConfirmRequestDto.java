package com.moit.advertisement.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequestDto {
    
    // 토스페이먼츠에서 발급해주는 결제 고유 키
    private String paymentKey;
    
    // 프론트엔드에서 생성해서 넘겼던 고유 주문번호 (예: AD_1_1638293019)
    private String orderId;
    
    // 사용자가 실제로 결제한 금액
    private BigDecimal amount;
    
}
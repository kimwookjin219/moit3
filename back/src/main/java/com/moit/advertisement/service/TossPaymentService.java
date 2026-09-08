package com.moit.advertisement.service;

import com.moit.advertisement.dto.PaymentConfirmRequestDto;

public interface TossPaymentService {
    
    /**
     * 토스페이먼츠 결제 최종 승인 요청
     * @param memberId 
     */
    void confirmPayment(PaymentConfirmRequestDto requestDto, Long memberId);
}
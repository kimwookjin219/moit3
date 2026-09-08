package com.moit.advertisement.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.moit.advertisement.dto.PaymentConfirmRequestDto;
import com.moit.advertisement.entity.Advertisement;
import com.moit.advertisement.entity.AdvertisementPayment;
import com.moit.advertisement.enums.AdStatus;
import com.moit.advertisement.enums.PaymentType;
// import com.moit.advertisement.enums.PaymentHistoryStatus; 
// import com.moit.advertisement.enums.PaymentStatus; 
import com.moit.advertisement.repository.AdvertisementPaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TossPaymentServiceImpl implements TossPaymentService {

    private final AdvertisementPaymentRepository paymentRepository;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    @Override
    @Transactional
    public void confirmPayment(PaymentConfirmRequestDto requestDto,
            	Long memberId) {
        
        // 1. 주문번호로 결제 내역 조회
        AdvertisementPayment payment = paymentRepository.findByOrderId(requestDto.getOrderId())
        		.orElseThrow(() -> {
        			log.warn("결제 내역을 찾을 수 없습니다. orderId={}", requestDto.getOrderId());
                    return new IllegalArgumentException("존재하지 않는 주문번호입니다.");
                });
        
        Advertisement advertisement = payment.getAdvertisement();

        if (!Objects.equals(
                advertisement.getAdvertiser().getId(),
                memberId
        )) {
            throw new IllegalStateException( "본인의 결제만 승인할 수 있습니다." );
        }
        
        // 2. 금액 검증 (위변조 방지)
        if (payment.getAmount().compareTo(requestDto.getAmount()) != 0) {
            throw new IllegalArgumentException("결제 금액이 일치하지 않습니다.");
        }

        // 3. 토스 승인 API 호출 세팅
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        
        // 시크릿 키 Base64 인코딩 (Toss 요구사항: 시크릿키 뒤에 콜론(:)을 붙여 인코딩)
        String authHeader = "Basic " + Base64.getEncoder()
                .encodeToString((tossSecretKey+ ":").getBytes(StandardCharsets.UTF_8));
        
        headers.set("Authorization", authHeader);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("paymentKey", requestDto.getPaymentKey());
        body.put("orderId", requestDto.getOrderId());
        body.put("amount", requestDto.getAmount());

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // 4. API 통신
        	ResponseEntity<JsonNode> response = restTemplate.postForEntity(
        	        "https://api.tosspayments.com/v1/payments/confirm",
        	        requestEntity,
        	        JsonNode.class
        	);

        	if (response.getStatusCode().is2xxSuccessful()) {

        	    JsonNode rootNode = response.getBody();

        	    String tossMethod = rootNode.path("method").asText();

        	    String paymentMethod;

        	    switch (tossMethod) {

        	        case "카드":
        	            paymentMethod = "CARD";
        	            break;

        	        case "간편결제":
        	            paymentMethod = "EASY_PAY";
        	            break;

        	        case "가상계좌":
        	            paymentMethod = "VIRTUAL_ACCOUNT";
        	            break;

        	        case "계좌이체":
        	            paymentMethod = "TRANSFER";
        	            break;

        	        case "휴대폰":
        	            paymentMethod = "MOBILE";
        	            break;

        	        default:
        	            paymentMethod = "OTHER";
        	            break;
        	    }
        	    
            	// 1. 결제 이력(History) 성공 처리
                payment.updatePaymentSuccess(requestDto.getPaymentKey(), paymentMethod); 
                
                log.info(
                	    "토스 결제 승인 완료. orderId={} | adId={} | paymentType={} | paymentMethod={}",
                	    requestDto.getOrderId(),
                	    advertisement.getAdId(),
                	    payment.getPaymentType(),
                	    paymentMethod
                	);
                
             // 결제 유형에 따른 광고 상태 처리
                if (payment.getPaymentType() == PaymentType.INITIAL) {

                    // 최초 결제
                    advertisement.completeInitialPayment();

                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime startDateTime =
                            advertisement.getStartDatetime();

                    if (startDateTime != null && now.isBefore(startDateTime)) {
                        advertisement.changeStatus( AdStatus.PENDING );
                    } else {
                        advertisement.changeStatus( AdStatus.OPEN );
                    }

                } else if (payment.getPaymentType() == PaymentType.EXTENSION) {

                    // 연장 결제
                    advertisement.completeExtensionPayment();

                    // 연장 일수 가져오기
                    Integer periodDays =
                            payment.getPeriodDays();

                    if (periodDays == null) {
                        throw new IllegalArgumentException(
                                "연장 기간 정보가 없습니다."
                        );
                    }

                    advertisement.extendEndDatetime( periodDays );
                } else {
                    throw new IllegalArgumentException( "지원하지 않는 결제 유형입니다." );
                }
            } else {
                throw new RuntimeException("토스 결제 승인 실패");
            }
        } catch (Exception e) {
            log.error(
                "토스 결제 승인 중 오류가 발생했습니다. orderId={} | memberId={}",
                requestDto.getOrderId(),
                memberId,
                e
            );

            throw new RuntimeException("토스 결제 승인 실패", e);
        }
    }
}
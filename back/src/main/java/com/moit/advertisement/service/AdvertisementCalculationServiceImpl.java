package com.moit.advertisement.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.advertisement.dto.AdvertisementCalculationResultDto;
import com.moit.advertisement.entity.AdvertisementPositionPrice;
import com.moit.advertisement.entity.AdvertisementPrice;
import com.moit.advertisement.enums.AdGrade;
import com.moit.advertisement.enums.AdPosition;
import com.moit.advertisement.enums.PaymentType;
import com.moit.advertisement.repository.AdvertisementPositionPriceRepository;
import com.moit.advertisement.repository.AdvertisementPriceRepository;

import lombok.RequiredArgsConstructor;
import java.time.Duration; 

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdvertisementCalculationServiceImpl implements AdvertisementCalculationService {

    private final AdvertisementPriceRepository priceRepository;
    private final AdvertisementPositionPriceRepository positionPriceRepository;

    // =========================================================
    // 전체 광고 금액 계산
    // =========================================================
    @Override
    public BigDecimal calculateTotalAmount(
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            AdGrade adGrade,
            PaymentType paymentType,
            List<AdPosition> positions) {

        return calculate(
                startDatetime,
                endDatetime,
                adGrade,
                paymentType,
                positions
        ).getTotalAmount();
    }

    // =========================================================
    // 광고 금액 계산 상세
    // =========================================================
    @Override
    public AdvertisementCalculationResultDto calculate(
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            AdGrade adGrade,
            PaymentType paymentType,
            List<AdPosition> positions) {

        if (startDatetime == null
                || endDatetime == null
                || adGrade == null
                || paymentType == null) {

            return AdvertisementCalculationResultDto.builder()
                    .totalDays(0)
                    .basePrice(BigDecimal.ZERO)
                    .positionPrice(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
        }

        // 광고 기간 계산 -> 시작일 / 종료일의 날짜 차이 + 1
        int totalDays = calculateTotalDays(
                startDatetime,
                endDatetime
        );

        if (totalDays <= 0) {

            return AdvertisementCalculationResultDto.builder()
                    .totalDays(0)
                    .basePrice(BigDecimal.ZERO)
                    .positionPrice(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
        }

        // 기본 광고비
        BigDecimal basePrice =
                calculateBasePrice(
                        totalDays,
                        adGrade,
                        paymentType
                );

        // 위치 추가금
        BigDecimal positionPrice = calculatePositionExtra(positions);

        // 최종 금액
        BigDecimal totalAmount = basePrice.add(positionPrice);

        return AdvertisementCalculationResultDto.builder()
                .totalDays(totalDays)
                .basePrice(basePrice)
                .positionPrice(positionPrice)
                .totalAmount(totalAmount)
                .build();
    }


    // 기본 광고비 계산
    /**
     * 가격표를 기간이 큰 순서대로 적용
     *
     * 예)
     * 90일 = 900,000
     * 60일 = 600,000
     * 30일 = 250,000
     *
     * 90일 광고
     * → 90일 가격 1개 적용
     */
    private BigDecimal calculateBasePrice(
            int totalDays,
            AdGrade adGrade,
            PaymentType paymentType) {

        BigDecimal totalBase = BigDecimal.ZERO;

        int remainingDays = totalDays;


        List<AdvertisementPrice> priceList =
                priceRepository
                        .findByPaymentTypeAndAdGradeOrderByPeriodDaysDesc(
                                paymentType,
                                adGrade
                        );


        for (AdvertisementPrice price : priceList) {

            int currentPeriod =
                    price.getPeriodDays();

            if (currentPeriod <= 0) {
                continue;
            }


            int count =
                    remainingDays / currentPeriod;


            if (count > 0) {

                BigDecimal addedPrice =
                        price.getBasePrice()
                                .multiply(
                                        BigDecimal.valueOf(count)
                                );

                totalBase =
                        totalBase.add(addedPrice);


                remainingDays -=
                        currentPeriod * count;
            }
        }

        // 가격표에 남은 기간이 있을 경우 가장 작은 기간 가격을 적용
        if (remainingDays > 0 && !priceList.isEmpty()) {

            AdvertisementPrice smallestPrice =
                    priceList.get(priceList.size() - 1);

            int smallestPeriod =
                    smallestPrice.getPeriodDays();


            if (smallestPeriod > 0) {

                int count =
                        (int) Math.ceil(
                                (double) remainingDays
                                        / smallestPeriod
                        );

                totalBase =
                        totalBase.add(
                                smallestPrice
                                        .getBasePrice()
                                        .multiply(
                                                BigDecimal.valueOf(count)
                                        )
                        );
            }
        }


        return totalBase;
    }

    // 위치별 추가 금액
    private BigDecimal calculatePositionExtra(
            List<AdPosition> positions) {

        if (positions == null
                || positions.isEmpty()) {

            return BigDecimal.ZERO;
        }


        BigDecimal totalExtra =
                BigDecimal.ZERO;


        List<AdvertisementPositionPrice> positionPrices =
                positionPriceRepository
                        .findByPositionIn(positions);


        for (AdvertisementPositionPrice pp
                : positionPrices) {

            if (pp.getAdditionalPrice() != null) {

                totalExtra =
                        totalExtra.add(
                                pp.getAdditionalPrice()
                        );
            }
        }


        return totalExtra;
    }
    
    // 광고 기간 계산
    @Override
    public int calculateTotalDays(
                LocalDateTime startDatetime,
                LocalDateTime endDatetime) {

        if (startDatetime == null
                || endDatetime == null) {

                return 0;
        }

        if (endDatetime.isBefore(startDatetime)) {
                return 0;
        }

        /*
        * 실제 시작/종료 시간 기준으로 계산한다.
        *
        * 09/01 02:00 ~ 09/01 10:00 = 1일
        * 09/01 02:00 ~ 09/02 02:00 = 1일
        * 09/01 02:00 ~ 09/02 02:01 = 2일
        * 09/01 02:00 ~ 09/07 04:00 = 6일 2시간 → 7일
        */
        Duration duration =
                Duration.between(startDatetime, endDatetime);

        long seconds = duration.getSeconds();

        // 24시간 단위로 올림
        return Math.max(
                1,
                (int) ((seconds + 86399) / 86400)
        );
    }
}
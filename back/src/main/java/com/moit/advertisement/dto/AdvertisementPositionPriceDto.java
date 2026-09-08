package com.moit.advertisement.dto;

import java.math.BigDecimal;
import com.moit.advertisement.enums.AdPosition;
import lombok.Data;

@Data
public class AdvertisementPositionPriceDto {
    private Long positionPriceId; // 🌟 주의: 엔티티의 PK 필드명(id 등)에 맞춰주세요!
    private AdPosition position;
    private BigDecimal additionalPrice;
}
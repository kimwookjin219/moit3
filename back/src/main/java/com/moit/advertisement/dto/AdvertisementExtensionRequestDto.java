package com.moit.advertisement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdvertisementExtensionRequestDto {

    @NotNull
    private Long adId;

    @NotNull
    private Integer periodDays;
    
    
}

// 결제하면 바로 연장
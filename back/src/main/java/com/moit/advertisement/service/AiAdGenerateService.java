package com.moit.advertisement.service;

import com.moit.advertisement.dto.AiAdRequestDto;
import com.moit.advertisement.dto.AiAdResponseDto;

public interface AiAdGenerateService {

    AiAdResponseDto generateAd(AiAdRequestDto dto);

}
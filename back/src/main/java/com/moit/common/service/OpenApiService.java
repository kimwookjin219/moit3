package com.moit.common.service;

import org.springframework.data.domain.Pageable;

import com.moit.common.dto.AddressSearchResponse;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsRequestDto;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsResponseDto;
import com.moit.common.dto.WeatherInfoRequest;
import com.moit.common.dto.WeatherInfoResponse;

public interface OpenApiService {
	public WeatherInfoResponse getWeathreInfo(WeatherInfoRequest request);
	public AddressSearchResponse.AddressSearchListResponseDto addressSearch(String keyword,Pageable pageable);
	public SolapiSmsResponseDto sendSms(SolapiSmsRequestDto request);
}

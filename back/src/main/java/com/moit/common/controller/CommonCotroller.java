package com.moit.common.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.common.dto.AddressSearchRequest;
import com.moit.common.dto.AddressSearchResponse;
import com.moit.common.dto.WeatherInfoRequest;
import com.moit.common.dto.WeatherInfoResponse;
import com.moit.common.service.OpenApiService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Common Api", description = "공통 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/common")
public class CommonCotroller {
	private final OpenApiService openApiService;
	
	@Operation(summary = "날씨", description = "날씨를 조회합니다.")
	@GetMapping("/weather")
	public ResponseEntity<WeatherInfoResponse> getWeather(WeatherInfoRequest request){
		WeatherInfoResponse response = openApiService.getWeathreInfo(request);
		return ResponseEntity.ok(response);
	}
	
	// GET /api/common/address-search?searchAddress=강남&size=10&page=0
	@Operation(summary = "주소", description = "주소를 검색/조회 합니다.")
	@GetMapping("/address-search") 
	public ResponseEntity<AddressSearchResponse.AddressSearchListResponseDto> addressSearch(AddressSearchRequest request, Pageable pageable){
		
		String searchAddress = request.getSearchAddress();

	   AddressSearchResponse.AddressSearchListResponseDto response =
			   openApiService.addressSearch(searchAddress, pageable);
	   
	   return ResponseEntity.ok(response);	 
	}
}

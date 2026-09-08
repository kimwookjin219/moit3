package com.moit.common.dto;

import lombok.Data;

@Data
public class WeatherInfoResponse {
	private Double tmp; //기온
	private Integer pop; // 강수확률
	private String sky; //하늘상태	
}
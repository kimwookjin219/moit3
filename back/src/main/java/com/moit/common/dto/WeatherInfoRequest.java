package com.moit.common.dto;

import lombok.Data;

@Data
public class WeatherInfoRequest {
	private String meetupDate;
	private Integer meetupTime;
	private Integer nx; // 예보지점 X 좌표
	private Integer ny; // 예보지점 Y 좌표
	
}

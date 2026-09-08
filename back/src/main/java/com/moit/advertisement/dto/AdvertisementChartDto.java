package com.moit.advertisement.dto;

import lombok.Data;

@Data
public class AdvertisementChartDto {
	// 총 통계
	private int totalAd;
	private int totalImp;
	private int totalClick;
	private Double avgCtr;
	// 증감률 
	private Double impChange;
	private Double clickChange;
	private Double ctrChange;
	private Double totalAdChange;
	 // 일별 차트
	private String statDate;
	private int impressions;
	private int clicks;
	 // CTR TOP5
	private String title;
    private Double ctr;
    //등급 비율
    private String adGrade;
    private int count;
    // 위치별 노출
    private String position;
    // 위치별 ctr 차트

}

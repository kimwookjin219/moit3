package com.moit.advertisement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementStatisticsDto {

    private Long adId;

    private Double recentCtr;
    private Double previousCtr;
    private Double repeatRate;

    private Double ctrDecrease;
    private Double fatigueScore;

    private String fatigueStatus;
}
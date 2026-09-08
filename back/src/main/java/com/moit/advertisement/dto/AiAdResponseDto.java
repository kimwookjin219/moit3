package com.moit.advertisement.dto;

import lombok.Data;

@Data
public class AiAdResponseDto {


    private String title;
    private String content;

    private Integer targetAgeMin;
    private Integer targetAgeMax;

    private String targetGender;

}
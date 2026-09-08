package com.moit.advertisement.dto;

import com.moit.advertisement.entity.Advertisement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdvertisementScore {

    private Advertisement advertisement;

    private double score;
}

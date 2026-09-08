package com.moit.advertisement.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.advertisement.dto.AiAdRequestDto;
import com.moit.advertisement.dto.AiAdResponseDto;
import com.moit.advertisement.service.AiAdGenerateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user/advertisement")
public class AiAdvertisementController {


    private final AiAdGenerateService aiAdGenerateService;


    @PostMapping("/aiAdvertise")
    public AiAdResponseDto test(
            @RequestBody AiAdRequestDto dto
    ){

        return aiAdGenerateService.generateAd(dto);

    }

}

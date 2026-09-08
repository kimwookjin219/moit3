package com.moit.advertisement.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AdvertisementServiceTest {


    @Autowired
    private AdvertisementService advertisementService;


    @Test
    @DisplayName("광고 Service Bean 생성 테스트")
    void serviceBeanTest(){

        assertThat(advertisementService)
                .isNotNull();

    }

    @Test
    @DisplayName("광고 개수 조회 - Mapper XML 연결 테스트")
    void selectTotalAdvertisementCntTest(){

        int count =
                advertisementService.selectTotalAdvertisementCnt();


        System.out.println(
            "승인 광고 개수 : " + count
        );


        assertThat(count)
                .isGreaterThanOrEqualTo(0);

    }
}
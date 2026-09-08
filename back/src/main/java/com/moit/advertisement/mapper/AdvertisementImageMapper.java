package com.moit.advertisement.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.moit.advertisement.dto.AdvertisementImageDto;

@Mapper
public interface AdvertisementImageMapper {

    // 이미지 등록
    int insertAdvertisementImage(AdvertisementImageDto dto);

    // 광고 이미지 목록
    List<AdvertisementImageDto> selectAdvertisementImageList(int adId);

    // 이미지 수정
    int updateAdvertisementImage(AdvertisementImageDto dto);

    // 단일 이미지 삭제
    int deleteAdvertisementImage(int imageId);

    // 광고기준 이미지 전체 삭제
    int deleteAdvertisementImages(int adId);

    

}
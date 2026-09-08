package com.moit.advertisement.service;

import java.math.BigDecimal;
import java.util.List;

import com.moit.advertisement.dto.AdvertisementPositionPriceDto;
import com.moit.advertisement.dto.AdvertisementPriceDto;

public interface AdvertisementPriceService {

    List<AdvertisementPriceDto> findAll();

    AdvertisementPriceDto findOne(Long priceId);

    AdvertisementPriceDto save(AdvertisementPriceDto dto);

    AdvertisementPriceDto update(
            Long priceId,
            AdvertisementPriceDto dto
    );

    void delete(Long priceId);

	List<AdvertisementPositionPriceDto> findAllPositionPrices();

	void updatePositionPrice(Long id, BigDecimal additionalPrice);
}
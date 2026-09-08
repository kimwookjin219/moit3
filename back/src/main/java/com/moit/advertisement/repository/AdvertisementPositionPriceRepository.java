package com.moit.advertisement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.advertisement.entity.AdvertisementPositionPrice;
import com.moit.advertisement.enums.AdPosition;

public interface AdvertisementPositionPriceRepository
        extends JpaRepository<AdvertisementPositionPrice, Long> {
	
	Optional<AdvertisementPositionPrice> findByPosition(
            AdPosition position
    );

	List<AdvertisementPositionPrice> findByPositionIn(List<AdPosition> positions);
	
	List<AdvertisementPositionPrice> findAllByOrderByPositionAsc();
}
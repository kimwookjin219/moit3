package com.moit.advertisement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.advertisement.entity.AdvertisementTargetRegion;

public interface AdvertisementTargetRegionRepository
        extends JpaRepository<AdvertisementTargetRegion, Long> {

	List<AdvertisementTargetRegion> findByAdvertisement_AdId(Long adId);
    List<AdvertisementTargetRegion> findByRegionCode(String regionCode);
    
}
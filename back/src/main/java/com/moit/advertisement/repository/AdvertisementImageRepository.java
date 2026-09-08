package com.moit.advertisement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.advertisement.entity.AdvertisementImage;
import com.moit.advertisement.enums.AdPosition;

public interface AdvertisementImageRepository
        extends JpaRepository<AdvertisementImage, Long> {
	
	List<AdvertisementImage> findByAdvertisement_AdId(Long adId);

	Optional<AdvertisementImage>
    findByAdvertisement_AdIdAndImageType(
            Long adId,
            AdPosition imageType
    );
}
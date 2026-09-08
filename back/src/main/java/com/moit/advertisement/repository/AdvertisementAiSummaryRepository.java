package com.moit.advertisement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.advertisement.entity.AdvertisementAiSummary;

public interface AdvertisementAiSummaryRepository extends JpaRepository<AdvertisementAiSummary, Long> {
	
	Optional<AdvertisementAiSummary>  findTopByOrderByCreatedAtDesc();
}

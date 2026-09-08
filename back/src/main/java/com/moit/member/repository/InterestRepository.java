package com.moit.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.Interest;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Long>{
	
	// 관심사 조회
	Optional<Interest> findByInterestName(String interestName);
}

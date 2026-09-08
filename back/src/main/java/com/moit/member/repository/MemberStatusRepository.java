package com.moit.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.MemberStatus;

@Repository
public interface MemberStatusRepository extends JpaRepository<MemberStatus, Long>{
	
	// 회원 상태 조회 (ACTIVE, PENDING ....)
	Optional<MemberStatus> findByStatusName(String statusName);
}

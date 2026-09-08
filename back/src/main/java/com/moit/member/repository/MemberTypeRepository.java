package com.moit.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.MemberType;

@Repository
public interface MemberTypeRepository extends JpaRepository<MemberType, Long>{
	
	// 권한조회 (ROLE_MEMBER, ROLE_ADMIN ....)
	Optional<MemberType> findByTypeName(String typeName);
}

package com.moit.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.MemberInfo;

@Repository
public interface MemberInfoRepository extends JpaRepository<MemberInfo, Long>{
	
}

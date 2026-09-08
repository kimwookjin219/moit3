package com.moit.member.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.MemberInterest;
import com.moit.member.entity.MemberInterestId;

@Repository
public interface MemberInterestRepository extends JpaRepository<MemberInterest, MemberInterestId>{
	
	// 회원 관심사 목록 조회
	List<MemberInterest> findByMember_Id(Long memberId);
	
	// 회원 관심사 전체 삭제
	void deleteByMember_Id(Long memberId);
}

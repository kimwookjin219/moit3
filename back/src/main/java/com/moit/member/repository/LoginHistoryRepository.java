package com.moit.member.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.member.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long>{
	
	// 회원별 로그인 기록 조회
    List<LoginHistory> findByMemberIdOrderByLoginAtDesc(Long memberId);
}

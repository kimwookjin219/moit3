package com.moit.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminMemberStatsDto {
	
	// 전체회원
	private Long allCount;
	// 관리자 
	private Long adminCount;
	// 일반회원
	private Long memberCount;
	// 정지 회원
	private Long suspendedCount;
	// 오늘 가입자 수
	private Long todayCount;
	
}

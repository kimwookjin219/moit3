package com.moit.reports.dto;

import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.ReportStatus;
import com.moit.reports.enums.TargetType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReportSearchDto {
//	private String filter;		// 필터 버튼 ALL, MEETUP, REVIEW, PENDING, DELETE
//	private String search;		// 검색 종류 MEMBER_NICKNAME, REASON
//	private String keyword;		// 검색 키워드 입력받기
	
	private TargetType targetType;	// MEETUP / REVIEW
	private ReportStatus status;	// PENDING / APPROVED / REJECTED
	private ReasonCode reasonCode;	// 사유 (드롭다운)
	private Character deleteYn;		// N / Y
	private String memberNickname;	// 닉네임 (키워드 검색)

//	private String searchType;		// memberNickname / reasonCode
//	private String keyword;			// 검색어
}

// 관리자 검색 기능
// 
// 상태
// PENDING / APPROVED / REJECTED
//
// 상태(논리삭제)
// DELETE
//
// 대상
// MEETUP / REVIEW
//
// 검색
// 작성자 / 신고사유 / 날짜
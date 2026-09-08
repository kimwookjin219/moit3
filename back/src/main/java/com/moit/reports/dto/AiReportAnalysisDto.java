package com.moit.reports.dto;

import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.TargetType;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AiReportAnalysisDto {	// 관리자 신고 판단 AI

	// 신고 정보
    private ReasonCode reasonCode;	// 신고 사유
    private String reasonDetail;	// 신고 내용
    
    // 신고 대상 정보
    private TargetType targetType;	// 신고 대상
    private Long targetId;			// 신고 대상
    private String targetTitle;		// 신고 제목
    private String targetContent;	// 신고 내용
}
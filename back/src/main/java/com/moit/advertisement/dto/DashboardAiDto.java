package com.moit.advertisement.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DashboardAiDto {
	
	 ////// ===== 통계 =====

    // 총 광고
    private int totalAd;
    // 총 노출
    private int totalImp;
    // 총 클릭
    private int totalClick;
    // 평균 CTR
    private Double avgCtr;
    // 광고 연장률
    private Double extensionRate;
    // 교체 권장 광고 개수
    private int fatigueWarningCount;
    // 가장 CTR이 높은 위치
    private String bestPosition;
    // 가장 CTR이 낮은 위치
    private String worstPosition;
    // 가장 많은 광고 등급
    private String topGrade;
    
    
    //////// ===== AI 결과 =====
    
	 // AI가 생성한 요약
    private String summary;
    // 생성 시각
    private String createdAt;
    // 요약 id
    private Integer summaryId;
}

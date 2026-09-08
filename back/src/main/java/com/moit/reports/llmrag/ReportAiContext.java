package com.moit.reports.llmrag;

import com.moit.reports.enums.ReasonCode;
import com.moit.reports.enums.TargetType;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportAiContext {	// 현재 사건 정보를 담을 DTO

    // 신고 번호
    private Long reportId;

    // ABUSE / SPAM / FAKE_INFO / NOSHOW / ETC
    private ReasonCode reasonCode;
    // 신고자가 작성한 내용
    private String reasonDetail;

    // MEETUP / REVIEW
    private TargetType targetType;
    // 신고 대상 ID
    private Long targetId;
    // 신고 당한 모임/리뷰 제목
    private String targetTitle;
    // 신고 당한 모임/리뷰 원문
    private String targetContent;
    
}
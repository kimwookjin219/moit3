package com.moit.member.dto;

import java.util.Map;

import lombok.Data;

@Data
public class SignupBehaviorDto {
	
	// 현재 AI 분석 대상 필드
    private String field;

    // 현재 필드의 실패 횟수
    private int failCount;
	
	// 전체 오류 횟수
    private int errorCount;

    // 필드별 오류 횟수
    private Map<String, Integer> fieldErrorCount;

    // 이메일 인증 실패 횟수
    private int emailVerificationFailCount;

    // 전화번호 인증 실패 횟수
    private int mobileVerificationFailCount;

    // 비밀번호 오류 횟수
    private int passwordErrorCount;

    // 현재 입력 중인 필드
    private String currentField;

    // 현재 필드 시작 시간
    private Long fieldStartTime;

    // 필드별 체류시간
    private Map<String, Long> fieldStayTime;
}

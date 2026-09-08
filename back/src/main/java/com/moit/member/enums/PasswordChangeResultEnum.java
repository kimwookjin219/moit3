package com.moit.member.enums;

public enum PasswordChangeResultEnum {

    SUCCESS,            // 성공
    WRONG_PASSWORD,     // 현재 비밀번호 불일치
    LEAKED_PASSWORD,    // 유출된 비밀번호
    API_ERROR           // HIBP API 오류

}
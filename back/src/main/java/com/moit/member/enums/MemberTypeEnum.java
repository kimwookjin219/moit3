package com.moit.member.enums;

public enum MemberTypeEnum {

    ROLE_MEMBER(1L),       // 일반 회원
    ROLE_PARTNER(2L),      // 제휴 업체
    ROLE_ADMIN(3L),        // 관리자
    ROLE_SUPERADMIN(4L);    // 최고 관리자
    
    private final Long id;
	
	MemberTypeEnum(Long id){ this.id = id; }
	
	public Long getId() { return id; }
}
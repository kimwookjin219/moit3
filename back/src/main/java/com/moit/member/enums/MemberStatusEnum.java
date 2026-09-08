package com.moit.member.enums;

public enum MemberStatusEnum {

    ACTIVE(1L),       // 활성화
    PENDING(2L),      // 대기중
    SUSPENDED(3L),    // 정지
    DELETED(4L);       // 삭제
	
	private final Long id;
	
	MemberStatusEnum(Long id){ this.id = id; }
	
	public Long getId() { return id; }
}
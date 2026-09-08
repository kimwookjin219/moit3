package com.moit.meetup.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ApplyStatus {
	PENDING("신청대기"),
	APPROVED("신청승인"),
	REJECTED("신청거절"),
	CANCELED("신청자취소"),
	NOSHOW("노쇼"),
	CANCEL_LAST_MINUTE("당일/24시간 이내 취소");
	private String desc;
}

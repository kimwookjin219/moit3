package com.moit.meetup.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
public enum MeetupNotificationSendStatus {
	PENDING("대기"),
	SENT("발송성공"),
	FAILED("발송실패");
	private String desc;
}

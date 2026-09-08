package com.moit.meetup.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum MeetupStatus {
	RECRUITING("모집중"),
	COMPLETED("모임완료"),
	CANCELED("모임취소"),
	DELETED("모임삭제"),
	WEATHER_CANCELED("기상학화로인한취소"),
	WEATHER_PENDING("기상 상태 감지로 인한 대기 상태");
	private String desc;
}

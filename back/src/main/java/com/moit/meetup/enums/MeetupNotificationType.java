package com.moit.meetup.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
public enum MeetupNotificationType {
	RAIN("비");
	private String desc;
}

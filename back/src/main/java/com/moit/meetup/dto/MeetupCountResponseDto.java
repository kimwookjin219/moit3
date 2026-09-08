package com.moit.meetup.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeetupCountResponseDto {
	// 통계데이터
    private Long totalMeetupCount;	// 전체모집글
    private Long recruitingCount;	// 모집중
    private Long completedCount;		// 모집마감
    private Long weatherCanceledCount;	// 날씨로 인한 취소
}

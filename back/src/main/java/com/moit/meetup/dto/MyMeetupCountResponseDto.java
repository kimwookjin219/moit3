package com.moit.meetup.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MyMeetupCountResponseDto {

    private Long myMeetupCount;       // 내 모집글
    private Long applicationCount;    // 신청 모임
    private Long reviewCount;         // 작성 후기
    private Long favoriteCount;       // 관심 모임
}
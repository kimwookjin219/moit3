package com.moit.meetup.dto;

import com.moit.meetup.enums.MeetupStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MeetupSearchRequestDto {
    private Long categoryId;
    private Long sidoId;
    private Long sigunguId;
    private String keyword;
    private MeetupStatus meetupStatus;
}

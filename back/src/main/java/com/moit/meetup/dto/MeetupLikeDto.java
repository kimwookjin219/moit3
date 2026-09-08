package com.moit.meetup.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeetupLikeDto {
    private Long meetupId;
    private Long memberId;
}

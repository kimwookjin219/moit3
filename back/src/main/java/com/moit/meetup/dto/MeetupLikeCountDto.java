package com.moit.meetup.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeetupLikeCountDto {
    private Long meetupId;
    private Long likeCount;
}

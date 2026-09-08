package com.moit.meetup.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeetupParticipantCountDto {

    private Long meetupId;
    private Long totalParticipants;
}

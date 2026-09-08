package com.moit.meetup.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PopularMeetupResponseDto {

    private Long id;
    private String title;

    private String nickname;

    private LocalDateTime meetupAt;

    private String sidoName;
    private String sigunguName;

    private String imagePath;

    private Long likeCount;

    private Integer maxParticipants;
    private Integer minParticipants;
    private Boolean hasLike = false;
    
    public PopularMeetupResponseDto(
            Long id,
            String title,
            String nickname,
            LocalDateTime meetupAt,
            String sidoName,
            String sigunguName,
            String imagePath,
            Long likeCount,
            Integer maxParticipants,
            Integer minParticipants
    ) {
        this.id = id;
        this.title = title;
        this.nickname = nickname;
        this.meetupAt = meetupAt;
        this.sidoName = sidoName;
        this.sigunguName = sigunguName;
        this.imagePath = imagePath;
        this.likeCount = likeCount;
        this.maxParticipants = maxParticipants;
        this.minParticipants = minParticipants;
        this.hasLike = false;
    }
    
    @Getter
    @Setter
    public static class PopularMeetupListResponseDto {
        private List<PopularMeetupResponseDto> meetups;
        private Long totalCount;
        private Long totalPage;
    }
}
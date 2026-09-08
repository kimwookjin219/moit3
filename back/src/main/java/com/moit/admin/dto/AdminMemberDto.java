package com.moit.admin.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminMemberDto {

    private Long memberId;
    private String loginId;
    private String nickname;
    private String email;
    private String mobile;
    private String profileUrl;
    private Long memberTypeId;
    private Long statusId;
    private String provider;
    private LocalDateTime createdAt;

}
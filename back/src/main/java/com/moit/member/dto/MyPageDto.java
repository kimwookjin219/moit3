package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class MyPageDto {
	private Integer memberId;
	private String loginId;
	private String nickname;
	private String email;
	private String mobile;
	private String profileUrl;
	private Integer point;
	private Integer trustScore;
	private LocalDate birth;
	private String gender;
	private String provider;
	private Long memberTypeId;
	
	private String createdAt;
	
	// 관심사
    private List<InterestDto> interests;
    
    @Data
    public static class InterestDto {
        private Long interestId;
        private String interestName;

        public InterestDto(Long interestId, String interestName) {
            this.interestId = interestId;
            this.interestName = interestName;
        }
    }
}

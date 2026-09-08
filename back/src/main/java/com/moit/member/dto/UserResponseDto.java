package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 응답
@Getter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserResponseDto {
	private Long memberId;
	private String loginId;
	private String email;
	private String nickname;
	private String mobile;
	private String profileUrl;
	private String gender;
	private LocalDate birth;
	private Long memberTypeId;
	private Long statusId;
	private String provider;
	private List<Integer> interestIds;
	
	private Integer point;
	private Integer trustScore;	// 신고... 매너점수(신뢰도점수) & 뱃지
	
	private String createdAt;
	private String updatedAt; 
	
	public static UserResponseDto from(UserDto user) {
		return UserResponseDto.builder()
				.memberId(user.getMemberId())
				.loginId(user.getLoginId())
				.email(user.getEmail())
				.nickname(user.getNickname())
				.mobile(user.getMobile())
				.profileUrl(user.getProfileUrl())
				.gender(user.getGender())
				.birth(user.getBirth())
				.memberTypeId(user.getMemberTypeId())
				.statusId(user.getStatusId())
				.provider(user.getProvider())
				.interestIds(user.getInterestIds())
				.point(user.getPoint())
				.trustScore(user.getTrustScore())	// 신고... 매너점수(신뢰도점수) & 뱃지
				.createdAt(user.getCreatedAt())
				.updatedAt(user.getUpdatedAt())
				.build();
	}
}

package com.moit.meetup.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.moit.meetup.entity.MeetupApplication;
import com.moit.meetup.enums.ApplyStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class MeetupApplicationDto {
	
	@Getter
	@Setter
	@NoArgsConstructor
	public static class MeetupApplicationRequestDto{
		private Long applicationId;
		private String rejectReason;
		private ApplyStatus applyStatus;
	}

	@Getter
	@Setter
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class MeetupApplicationResponseDto {
		//내가 신청한 모집글
		private Long id;
		private String rejectReason;
		private Long meetupId;
		private String meetupTitle;
		private LocalDateTime meetupAt;
		private String applyStatus;
		private String meetupStatus;
		private LocalDateTime updateAt;
		
		public static MeetupApplicationResponseDto fromEntity(MeetupApplication application) {
			return MeetupApplicationResponseDto.builder()
										.id(application.getId())
										.applyStatus(application.getApplyStatus().getDesc())
						                .rejectReason(application.getRejectReason())
						                .meetupId(application.getMeetup().getId())
						                .meetupTitle(application.getMeetup().getTitle())
						                .meetupAt(application.getMeetup().getMeetupAt())
						                .meetupStatus(application.getMeetup().getMeetupStatus().getDesc())
						                .updateAt(application.getUpdatedAt())
						                .build();
		}
	}
	
	@Getter
	@Setter
	public static class MyApplicationListResponseDto{
		//내가 신청한 모집글 목록 조회(페이징)
		private List<MeetupApplicationResponseDto> applications;
		private Long totalCount;
		private Long totalPage;
	}	
	
	@Getter
	@Setter
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor	
	public static class MeetupApplicantResponseDto {
		//마이페이지 내 모집글 신청자조회
		private Long applicationId;
		private Long memberId;
		private String nickname;
		private String rejectReason;
		private String aiSummary; 
		private ApplyStatus applyStatus;
		private LocalDateTime updateAt;
		
		public static MeetupApplicantResponseDto fromEntity(MeetupApplication application) {
			return MeetupApplicantResponseDto.builder()
										.applicationId(application.getId())
										.memberId(application.getMember().getId())
										.nickname(application.getMember().getNickname())
						                .rejectReason(application.getRejectReason())
						                .aiSummary(application.getMember().getMemberInfo().getAiSummary())
						                .applyStatus(application.getApplyStatus())
						                .updateAt(application.getUpdatedAt())
						                .build();
		}
	}
	
	@Getter
	@Setter
	public static class MeetupApplyMemberListResponseDto{
		//마이페이지 내 모집글 신청자 리스트(페이징)
		private List<MeetupApplicantResponseDto> applicants;
		private Long totalCount;
		private Long totalPage;
	}
	
}

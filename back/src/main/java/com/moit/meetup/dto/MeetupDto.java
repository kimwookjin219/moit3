package com.moit.meetup.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.moit.common.entity.Sigungu;
import com.moit.meetup.entity.Meetup;
import com.moit.meetup.enums.ApplyStatus;
import com.moit.meetup.enums.MeetupStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class MeetupDto {
	
	@Setter
	@Getter
	@NoArgsConstructor
	public static class MeetupRequestDto{
		private Long id;
		private Long memberId;
		private String title;
		private String content;
		private Integer maxParticipants;
		private Integer minParticipants;
		private Long sigunguId;
		private Long categoryId;
		private String address;
		private LocalDateTime meetupAt;
		private MeetupStatus meetupStatus;
		private Double latitude;
		private Double longitude;
		private String addressDetail;
		private Integer nx;
		private Integer ny;	
	}
	
	@Getter
	@Setter
	public static class MeetupResponseDto{
		private Long id;
	    private Long memberId;
		private String title;
		private String content;
		private Integer maxParticipants;
		private Integer minParticipants;

		private String address;
		private LocalDateTime meetupAt;
		private MeetupStatus meetupStatus;
		private Double latitude;
		private Double longitude;
		private String addressDetail;
		private Integer nx;
		private Integer ny;
		private ApplyStatus applyStatus;
		
		private String nickname;
		
		private Long sigunguId;
		private String sigunguName;
		private String sidoName;
		
		private Long totalParticipants = 0L;
		private Boolean hasLike = false;
		private Long likeCount = 0L;
		private String imagePath;
		private List<String> imagePaths;
		private String categoryName;
		private Long categoryId;
		private Boolean hidden;
		private Integer trustScore;
		
		private Long hostMeetupCount; // 개설한 모임 수
		private Long completedMeetupCount;  // 완료된 모임 수
		private Long noShowCount;  // 노쇼 횟수
		private LocalDateTime createdAt;
		
		public static MeetupResponseDto listFrom(Meetup meetup) { // list에만 보여줄 MeetupResponse
			MeetupResponseDto response = new MeetupResponseDto();
			Sigungu sigungu = meetup.getSigungu();
	
			response.setId(meetup.getId());
			response.setTitle(meetup.getTitle());
			response.setNickname(meetup.getMember().getNickname());
			
		    response.setMaxParticipants(meetup.getMaxParticipants());
		    response.setMinParticipants(meetup.getMinParticipants());

		    response.setAddress(meetup.getAddress());
		    response.setAddressDetail(meetup.getAddressDetail());

		    response.setMeetupAt(meetup.getMeetupAt());
		    response.setMeetupStatus(meetup.getMeetupStatus());
			
			response.setSigunguId(sigungu.getId());
			response.setSidoName(sigungu.getSido().getName());
			response.setSigunguName(sigungu.getName());
			response.setHidden(meetup.getHidden());
			
			response.setCategoryId(meetup.getMeetupCategory().getId());
			response.setCategoryName(
			        meetup.getMeetupCategory().getCategoryName()
			);
			
			response.setCreatedAt(meetup.getCreatedAt());
			
			 // 대표 이미지
		    if (meetup.getMeetupImages() != null
		            && !meetup.getMeetupImages().isEmpty()) {

		        response.setImagePath(
		            meetup.getMeetupImages()
		                   .get(0)
		                   .getImage()
		                   .getImagePath()
		        );
		    }
			
			return response;
		}
		
		public static MeetupResponseDto detailFrom(Meetup meetup, Long memberId, Long hostMeetupCount, Long completedMeetupCount, Long noShowCount) { // 상세페이지 MeetupResponse
		    MeetupResponseDto response = new MeetupResponseDto();

		    response.setId(meetup.getId());
		    response.setMemberId(meetup.getMember().getId());
		    response.setTitle(meetup.getTitle());
		    response.setContent(meetup.getContent());
		    response.setMaxParticipants(meetup.getMaxParticipants());
		    response.setMinParticipants(meetup.getMinParticipants());
		    response.setAddress(meetup.getAddress());
		    response.setMeetupAt(meetup.getMeetupAt());
		    response.setMeetupStatus(meetup.getMeetupStatus());
		    response.setLatitude(meetup.getLatitude());
		    response.setLongitude(meetup.getLongitude());
		    response.setAddressDetail(meetup.getAddressDetail());
		    response.setNx(meetup.getNx());
		    response.setNy(meetup.getNy());
		    
		    response.setMemberId(meetup.getMember().getId());
		    response.setNickname(meetup.getMember().getNickname());
		    response.setSigunguId(meetup.getSigungu().getId());
		    response.setSigunguName(meetup.getSigungu().getName());
		    response.setCategoryId(meetup.getMeetupCategory().getId());
		    response.setCategoryName(meetup.getMeetupCategory().getCategoryName());
		    response.setMeetupStatus(meetup.getMeetupStatus());
		    response.setHidden(meetup.getHidden());
		    response.setTrustScore(meetup.getMember().getMemberInfo().getTrustScore());
		    response.setHostMeetupCount(hostMeetupCount);
		    response.setCompletedMeetupCount(completedMeetupCount);
		    response.setNoShowCount(noShowCount);
		    
		    // 현재 로그인한 사용자의 신청 상태
		    if (memberId != null) {
		        meetup.getMeetupApplications().stream()
		                .filter(application ->
		                        application.getMember().getId().equals(memberId)
		                )
		                .findFirst()
		                .ifPresent(application ->
		                        response.setApplyStatus(application.getApplyStatus())
		                );
		    }
		    
		    // 전체 이미지
		    if (meetup.getMeetupImages() != null
		            && !meetup.getMeetupImages().isEmpty()) {

		        response.setImagePaths(
		            meetup.getMeetupImages()
		                    .stream()
		                    .map(meetupImage ->
		                        meetupImage.getImage().getImagePath()
		                    )
		                    .toList()
		        );
		    } else {
		        response.setImagePaths(List.of());
		    }
		    
		    return response;
		}
	}
	
	//목록조회 응답용 dto
	@Getter
	@Setter
	public static class MeetupListResponseDto{
		private List<MeetupResponseDto> meetups;
		private Long totalCount; //전체갯수 100 , 101
		private Long totalPage;  //총 몇개 페이지를 만들것인가 10개씩 보여준다고하면  10개 페이지가 나옴 , 11페이지
	}
	
}


package com.moit.meetup.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.moit.common.dto.SigunguDto;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplicationRequestDto;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplyMemberListResponseDto;
import com.moit.meetup.dto.MeetupApplicationDto.MyApplicationListResponseDto;
import com.moit.meetup.dto.MeetupCategoryDto;
import com.moit.meetup.dto.MeetupCountResponseDto;
import com.moit.meetup.dto.MeetupDto.MeetupListResponseDto;
import com.moit.meetup.dto.MeetupDto.MeetupRequestDto;
import com.moit.meetup.dto.MeetupDto.MeetupResponseDto;
import com.moit.meetup.dto.MyMeetupCountResponseDto;
import com.moit.meetup.dto.PopularMeetupResponseDto;
import com.moit.meetup.dto.openapi.RecommendMeetupRequestDto;
import com.moit.meetup.dto.openapi.RecommendMeetupResponseDto;
import com.moit.meetup.enums.MeetupStatus;

public interface MeetupService {
	
	//목록조회
	public MeetupListResponseDto search(
	        Pageable pageable,
	        Long memberId,
	        MeetupStatus status,
	        String searchType,
	        String searchText,
	        Long sidoId,
	        Long categoryId,
	        String orderType
	);
	
	//상세조회
	public MeetupResponseDto detail(Long meetupId, Long memberId);
	
	//저장
	public void create(MeetupRequestDto meetupRequest, Long memberId, List<MultipartFile> files);
	
	//수정
	public void update(MeetupRequestDto meetupRequest, Long meetupId, List<MultipartFile> files, List<String> existingImagePaths, Long memberId);
	
	//삭제
	public void delete(Long meetupId, Long memberId);	
	
	//모임신청
	public void apply(Long memberId, Long meetupId);
	
	//좋아요
	public void meetupLike(Long memberId, Long meetupId);
	
	//모집글 비공개(관리자)
	public void changeMeetupVisibility(Long meetupId);
	
	//마이페이지 내가 신청한 모집글 목록 조회(페이징)
	public MyApplicationListResponseDto getMyApplications(Long memberId, Pageable pageable);
	
	//마이페이지 내 모집글 신청자 리스트(페이징)
	public MeetupApplyMemberListResponseDto getMyMeetupApplicants(Long memberId, Long meetupId, Pageable pageable);
	
	//마이페이지 내가 모집한 모집글 조회(페이징)
	public MeetupListResponseDto getMyMeetups(Long memberId, Pageable pageable);
	
	//마이페이지 승인, 거절(거절사유), 노쇼 처리
	public void updateApplicationStatus(MeetupApplicationRequestDto requestDto);

	//카테고리 조회
	public List<MeetupCategoryDto> getCategory();
	
	//시군구 조회
	public List<SigunguDto> getSigungu();
	
	//마이페이지-통계
	public MyMeetupCountResponseDto getMyMeetupCount(Long memberId);
	
	// 관리자 통계
    public MeetupCountResponseDto getMeetupCount();
	
    //인기모임 
    public List<PopularMeetupResponseDto> getPopularMeetups(Long memberId);

    //추천모임
    public List<MeetupResponseDto> getRecommendedMeetups(Long memberId, Long meetupId);
    
    //끌어올리기
    public void boostMeetup(Long memberId, Long meetupId);
    
	// ################### open api ###################
	//ai 제목/카테고리/컨텐츠 추가
	public RecommendMeetupResponseDto meetupWriteAiRecommended(RecommendMeetupRequestDto request);
	
	// 날씨 알림 sms
	public void sendTomorrowWeatherNotification();
	
	// 하루 등록한 모임 수 조회
	public Long todayMeetupCount(Long memberId);
}

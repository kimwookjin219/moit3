package com.moit.meetup.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.moit.common.dto.SigunguDto;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsRequestDto;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsResponseDto;
import com.moit.common.service.OpenApiService;
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
import com.moit.meetup.service.MeetupService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// http://localhost:8080/swagger-ui/index.html - Swagger test주손

@Tag(name = "Meetup Api", description = "게시글 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meetups")
//@CrossOrigin(origins = "*")
public class MeetupController {

	private final MeetupService meetupService;
	private final OpenApiService openApiService;
	
	@Operation(summary = "모임리스트조회", description = "모임리스트를 조회합니다.")
	@GetMapping
	public ResponseEntity<MeetupListResponseDto> search(
	        Pageable pageable,

	        @RequestParam(name = "status", required = false)
	        MeetupStatus status,

	        @RequestParam(name = "searchType", required = false)
	        String searchType,
	        @RequestParam(name = "searchText", required = false)
	        String searchText,

	        @RequestParam(name = "sidoId", required = false)
	        Long sidoId,

	        @RequestParam(name = "categoryId", required = false)
	        Long categoryId,

	        @RequestParam(name = "orderType", required = false, defaultValue = "createAt")
	        String orderType,

	        Authentication authentication
	) {

	    Long memberId = null;

	    // 로그인한 경우에만 memberId 가져오기
	    if (authentication != null
	            && authentication.isAuthenticated()
	            && authentication.getPrincipal() instanceof CustomUserDetails) {

	        CustomUserDetails userDetails =
	                (CustomUserDetails) authentication.getPrincipal();

	        memberId = userDetails.getAppUserId();
	    }
	    
	    MeetupListResponseDto listResponseDto =
	            meetupService.search(
	                    pageable,
	                    memberId,
	                    status,
	                    searchType,
	                    searchText,
	                    sidoId,
	                    categoryId,
	                    orderType
	            );

	    return ResponseEntity.ok(listResponseDto);
	}

	@Operation(summary = "모임상세조회", description = "모임 상세를 조회합니다.")
	@GetMapping("/{meetupId}")
	public ResponseEntity<MeetupResponseDto> detail(@PathVariable("meetupId") Long meetupId, Authentication authentication){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();	
		MeetupResponseDto meetupResponseDto = meetupService.detail(meetupId, memberId);
		
		return ResponseEntity.ok(meetupResponseDto);
	}
	
	@Operation(summary = "모임등록", description = "모임을 등록합니다.")
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> create(@ModelAttribute MeetupRequestDto meetupRequestDto,
						               @RequestPart(name = "files", required = false) List<MultipartFile> files,
						               Authentication authentication) {
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();	
		//Long memberId = 1L;
		meetupService.create(meetupRequestDto, memberId, files);
		
		return ResponseEntity.status(HttpStatus.CREATED).build(); // 성공 응답 201
	}
	
	@Operation(summary = "모임수정", description = "모임을 수정합니다.")
	@PutMapping("/{meetupId}")
	public ResponseEntity<Void> update(@ModelAttribute MeetupRequestDto meetupRequestDto,
								       @RequestParam(value = "files", required = false) List<MultipartFile> files,
							           @RequestParam(value = "existingImagePaths", required = false) List<String> existingImagePaths,
							           @PathVariable("meetupId") Long meetupId,
							           Authentication authentication
							           ){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId(); 
    	
		// null 방지
	    List<String> safeExistingPaths = (existingImagePaths != null) ? existingImagePaths : Collections.emptyList();
	    List<MultipartFile> safeFiles = (files != null) ? files : Collections.emptyList();
		
		meetupService.update(meetupRequestDto, meetupId, safeFiles, safeExistingPaths, memberId);
		return ResponseEntity.noContent().build(); // 성공 응답 204
	}
	
	@Operation(summary = "관리자/개설자 모임삭제", description = "모임을 삭제합니다.")
	@DeleteMapping("/{meetupId}")
	public ResponseEntity<Void> delete(@PathVariable("meetupId") Long meetupId, Authentication authentication){
		CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();
    	
		meetupService.delete(meetupId, memberId);
		return ResponseEntity.noContent().build(); // 성공 응답 204
	}
	
	@Operation(summary = "모임신청", description = "모임을 신청합니다.")
	@PostMapping("/{meetupId}/apply")
	public ResponseEntity<Void> apply(@PathVariable("meetupId") Long meetupId, Authentication authentication){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId(); 
		//Long memberId = 1L;
		meetupService.apply(memberId, meetupId);
		
		return ResponseEntity.ok().build(); // 성공 응답 200
	}
	
	@Operation(summary = "좋아요", description = "모임 좋아요.")
	@PatchMapping("/{meetupId}/like")
	public ResponseEntity<Void> meetupLike(@PathVariable("meetupId") Long meetupId, Authentication authentication){
    	
	    if (authentication == null || !authentication.isAuthenticated()) {
	        return ResponseEntity
	                .status(HttpStatus.UNAUTHORIZED)
	                .build();
	    }
		
		CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();
		//Long memberId = 1L;
		meetupService.meetupLike(memberId, meetupId);
		
		return ResponseEntity.ok().build(); // 성공 응답 200
	}	
	
	@Operation(summary = "관리자 모집글 공개/비공개 전환",  description = "관리자가 모집글의 공개 여부를 변경합니다.")
	@PatchMapping("/{meetupId}/visibility")
	public ResponseEntity<Void> changeMeetupVisibility(@PathVariable("meetupId") Long meetupId){
		meetupService.changeMeetupVisibility(meetupId);
		return ResponseEntity.ok().build();
	}
	
	@Operation(summary = "마이페이지 내 신청 조회", description = "내가 신청한 모집글 목록을 조회합니다.")
	@GetMapping("/applications")
	public ResponseEntity<MyApplicationListResponseDto> getMyApplications(Pageable pageable, Authentication authentication){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();
		//Long memberId = 1L;
		MyApplicationListResponseDto  response = meetupService.getMyApplications(memberId, pageable);
		
		return ResponseEntity.ok(response);
	}	
	
	@Operation(summary = "마이페이지 내 모집글 - 신청자 리스트 조회", description = "모집글 신청자 리스트를 조회합니다.")
	@GetMapping("/{meetupId}/applicants")
	public ResponseEntity<MeetupApplyMemberListResponseDto> getMyMeetupApplicants(@PathVariable("meetupId") Long meetupId, Pageable pageable, Authentication authentication){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();
    	//Long memberId = 1L;
		MeetupApplyMemberListResponseDto  response = meetupService.getMyMeetupApplicants(meetupId, memberId, pageable);
		
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "마이페이지 내 모집글 조회", description = "내가 모집한 모집글 목록을 조회합니다.")
	@GetMapping("/my")
	public ResponseEntity<MeetupListResponseDto> getMyMeetups(Pageable pageable, Authentication authentication){
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();
		//Long memberId = 1L;
		MeetupListResponseDto  response = meetupService.getMyMeetups(memberId, pageable);
		
		return ResponseEntity.ok(response);
	}
	
	@Operation(summary = "모집글 신청 상태 변경", description = "모집자가 신청자의 신청 상태를 승인, 거절 또는 노쇼로 변경합니다.")
	@PatchMapping("/applications/status")
	public ResponseEntity<Void> updateApplicationStatus(@RequestBody MeetupApplicationRequestDto requestDto){
		
		meetupService.updateApplicationStatus(requestDto);
		
		return ResponseEntity.ok().build();
	}	
	
	@Operation(summary = "카테고리조회", description = "카테고리를 조회합니다.")
	@GetMapping("/category")
	public ResponseEntity<List<MeetupCategoryDto>> getCategory(){		
		
		return ResponseEntity.ok(meetupService.getCategory());
	}
	
	@Operation(summary = "시군구조회", description = "시군구를 조회합니다.")
	@GetMapping("/sigungu")
	public ResponseEntity<List<SigunguDto>> getSigungu(){		
		
		return ResponseEntity.ok(meetupService.getSigungu());
	}
	
	@Operation(summary = "마이페이지 통계데이터", description = "통계 조회합니다.")
	@GetMapping("/my-count")
	public ResponseEntity<MyMeetupCountResponseDto> getMyMeetupCount(
	        Authentication authentication
	) {
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();    	
    	Long memberId = userDetails.getAppUserId();

	    return ResponseEntity.ok(
	            meetupService.getMyMeetupCount(memberId)
	    );
	}
	
	 // 관리자 통계
	@Operation(summary = "관리자 통계데이터", description = "관리자 모임 통계 조회합니다.")
    @GetMapping("/count")
    public ResponseEntity<MeetupCountResponseDto> getMeetupCount() {
        return ResponseEntity.ok(meetupService.getMeetupCount());
    }
	
    //인기모임
	@Operation(summary = "인기모임 조회", description = "main 페이지 인기모임을 조회합니다.")
    @GetMapping("/popular")
    public ResponseEntity<List<PopularMeetupResponseDto>> getPopularMeetups(Authentication authentication) {
        Long memberId = null;

        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails) {

            CustomUserDetails userDetails =
                    (CustomUserDetails) authentication.getPrincipal();

            memberId = userDetails.getAppUserId();
        }

        return ResponseEntity.ok(
                meetupService.getPopularMeetups(memberId)
        );
    }
    
    // 추천 모임
	@Operation(summary = "추천모임 조회", description = "detail 페이지 추천모임을 조회합니다.")
    @GetMapping("/{meetupId}/recommended")
    public ResponseEntity<List<MeetupResponseDto>> getRecommendedMeetups(
            @PathVariable("meetupId") Long meetupId,
            Authentication authentication
    ) {

        Long memberId = null;

        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails) {

            CustomUserDetails userDetails =
                    (CustomUserDetails) authentication.getPrincipal();

            memberId = userDetails.getAppUserId();
        }

        return ResponseEntity.ok(
                meetupService.getRecommendedMeetups(memberId, meetupId)
        );
    }
    
    // 끌어올리기
	@Operation(summary = "모임 끌어올리기", description = "7일동안 상단에 노출될 수 있도록 끌어올려 줍니다.")
    @PostMapping("/{meetupId}/boost")
    public ResponseEntity<Void> boostMeetup(@PathVariable("meetupId") Long meetupId, Authentication authentication){
    	
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();
        
        meetupService.boostMeetup(memberId, meetupId);
        
        return ResponseEntity.ok().build();
    }
    
	// 하루 모임 수 조회
	@GetMapping("/todayMeetupCount")
	public ResponseEntity<Long> todayMeetupCount(Authentication authentication){
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();
        
        Long todayCount = meetupService.todayMeetupCount(memberId);
        
        return ResponseEntity.ok(todayCount);        
	}
	
	// ################### open api ###################

	@Operation(summary = "AI 모임 제목/카테고리/내용 추천", description = "사용자가 입력한 키워드를 기반으로 AI가 모임 제목, 카테고리, 내용을 추천합니다.")
	@PostMapping("/write/ai/recommended")
	public ResponseEntity<RecommendMeetupResponseDto> meetupWriteAiRecommended(@RequestBody RecommendMeetupRequestDto request){
		return ResponseEntity.ok(meetupService.meetupWriteAiRecommended(request));
	}
		
//	@Operation(summary = "날씨 알림 문자 발송", description = "날씨 알림 문자 발송 테스트용")
//	@PostMapping("/notification")
//	public ResponseEntity<SolapiSmsResponseDto> sendSms(@RequestBody SolapiSmsRequestDto request){
//		
//	    SolapiSmsResponseDto response =
//	            openApiService.sendSms(request);
//
//	    return ResponseEntity.ok(response);
//	}

}

//성공 응답
//조회(GET)	200 OK
//생성(POST)	201 Created
//수정(PUT/PATCH)	200 OK 또는 204 No Content(응답데이터없을때)
//삭제(DELETE)	204 No Content
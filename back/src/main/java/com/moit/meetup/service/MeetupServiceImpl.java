package com.moit.meetup.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moit.common.dto.SigunguDto;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsRequestDto;
import com.moit.common.dto.WeatherInfoRequest;
import com.moit.common.dto.WeatherInfoResponse;
import com.moit.common.entity.Image;
import com.moit.common.entity.Sigungu;
import com.moit.common.repository.ImageRepository;
import com.moit.common.service.OpenApiService;
import com.moit.config.ThymeleafConfig;
import com.moit.exception.ResourceNotFoundException;
import com.moit.meetup.client.OpenAiApiClient;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplicantResponseDto;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplicationRequestDto;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplicationResponseDto;
import com.moit.meetup.dto.MeetupApplicationDto.MeetupApplyMemberListResponseDto;
import com.moit.meetup.dto.MeetupApplicationDto.MyApplicationListResponseDto;
import com.moit.meetup.dto.MeetupCategoryDto;
import com.moit.meetup.dto.MeetupCountResponseDto;
import com.moit.meetup.dto.MeetupDto.MeetupListResponseDto;
import com.moit.meetup.dto.MeetupDto.MeetupRequestDto;
import com.moit.meetup.dto.MeetupDto.MeetupResponseDto;
import com.moit.meetup.dto.MeetupLikeCountDto;
import com.moit.meetup.dto.MeetupLikeDto;
import com.moit.meetup.dto.MeetupParticipantCountDto;
import com.moit.meetup.dto.MyMeetupCountResponseDto;
import com.moit.meetup.dto.PopularMeetupResponseDto;
import com.moit.meetup.dto.openapi.RecommendMeetupRequestDto;
import com.moit.meetup.dto.openapi.RecommendMeetupResponseDto;
import com.moit.meetup.entity.Meetup;
import com.moit.meetup.entity.MeetupApplication;
import com.moit.meetup.entity.MeetupBoost;
import com.moit.meetup.entity.MeetupCategory;
import com.moit.meetup.entity.MeetupImage;
import com.moit.meetup.entity.MeetupLike;
import com.moit.meetup.entity.MeetupNotification;
import com.moit.meetup.enums.ApplyStatus;
import com.moit.meetup.enums.MeetupNotificationSendStatus;
import com.moit.meetup.enums.MeetupNotificationType;
import com.moit.meetup.enums.MeetupStatus;
import com.moit.meetup.repository.MeetupApplicationRepository;
import com.moit.meetup.repository.MeetupBoostRepository;
import com.moit.meetup.repository.MeetupCategoryRepository;
import com.moit.meetup.repository.MeetupImageRepository;
import com.moit.meetup.repository.MeetupLikesRepository;
import com.moit.meetup.repository.MeetupNotificationRepository;
import com.moit.meetup.repository.MeetupRepository;
import com.moit.meetup.repository.MeetupSigunguRepository;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberInfo;
import com.moit.member.entity.PointHistory;
import com.moit.member.enums.MemberTypeEnum;
import com.moit.member.repository.MemberRepository;
import com.moit.member.repository.PointHistoryRepository;
import com.moit.util.UtilUpload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MeetupServiceImpl implements MeetupService{

    private final ThymeleafConfig thymeleafConfig;
	
    private static final String TRUST_SCORE_KEY_PREFIX = "trust:meetup-completed:";
	private static final String BOOST_KEY_PREFIX = "meetup:boost:";
	private static final int BOOST_POINT = 200; // 끌어올리기 비용
	
	private final MeetupRepository meetupRepository;
	private final MeetupApplicationRepository meetupApplicationRepository;
	private final MeetupLikesRepository meetupLikesRepository;
	private final MemberRepository memberRepository; 
	private final MeetupCategoryRepository meetupCategoryRepository;
	private final MeetupSigunguRepository meetupSigunguRepository;
	private final UtilUpload utilUpload;
	private final MeetupImageRepository meetupImageRepository;
	private final ImageRepository imageRepository;
	private final OpenAiApiClient openAiApiClient;
    private final MeetupBoostRepository meetupBoostRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final OpenApiService openApiService;
    private final MeetupNotificationRepository meetupNotificationRepository;

	//모임리스트조회
	@Override
	public MeetupListResponseDto search(
	        Pageable pageable,
	        Long memberId,
	        MeetupStatus status,
	        String searchType,
	        String searchText,
	        Long sidoId,
	        Long categoryId,
	        String orderType
	) {

	    Page<Meetup> page = meetupRepository.findByDeleteYn(
	            'N',
	            status,
	            searchType,
	            searchText,
	            sidoId,
	            categoryId,
	            orderType,
	            pageable
	    );
//		page.getTotalPages(); // 전체페이지수 100개라면 10개
//		page.getNumberOfElements(); // 전체갯수 100개
//		page.getContent(); // 0번째 페이지의 10개가 들어있음

		MeetupListResponseDto listResponse = new MeetupListResponseDto();
		listResponse.setTotalCount(page.getTotalElements()); // Page클레스에서 제공하는 getTotalElement
		listResponse.setTotalPage((long)page.getTotalPages()); //Page클레스에서 제공하는  getTotalPages
		
		List<Meetup> contents = page.getContent(); //조회한갯수만큼 나옴 - 10개씩
		List<MeetupResponseDto> list = new ArrayList<>(); 
		for(int i=0; i < contents.size(); i++) {// entity -> dto로 변환
			Meetup meetup = contents.get(i);			
			list.add(MeetupResponseDto.listFrom(meetup));
		}
		
		//list에서 id꺼내기
		List<Long> ids = list.stream().map(item -> item.getId()).toList();
		
		//쿼리통해서 ids에 해당하는 total_participants 를 구함
		List<MeetupParticipantCountDto> result = meetupApplicationRepository.countByMeetup_IdInAndApplyStatusAndDeleteYn(ids, ApplyStatus.APPROVED, 'N');
		
		// 모임 신청 인원 추출
		list.forEach(item->{
			
			result.forEach(cnt->{
				
				if(item.getId().equals(cnt.getMeetupId())) {
					item.setTotalParticipants(cnt.getTotalParticipants());
					return;
				}
			});
			
		});
		
		//쿼리통해서 ids에 해당하는 like 를 구함
		List<MeetupLikeDto> likeResult =
		        meetupLikesRepository.findLikedMeetups(ids, memberId);
			
		//내가 좋아요 눌렀는지 추출
		list.forEach(meetup ->{
			likeResult.forEach(like->{
				if(like.getMeetupId().equals(meetup.getId())) {
					meetup.setHasLike(true);
				}
			});
		});
		
		
		List<MeetupLikeCountDto> likeCount =
		        meetupLikesRepository.countByMeetup_Id(ids);	
		
		//조회된 모임의 좋아요 수
		list.forEach(meetup ->{
			likeCount.forEach(cnt->{
				if(cnt.getMeetupId().equals(meetup.getId())) {
					meetup.setLikeCount(cnt.getLikeCount());
				}
			});
		});	

		listResponse.setMeetups(list);
		return listResponse;

	}
	
	// 상세조회
	@Override
	public MeetupResponseDto detail(Long meetupId, Long memberId) {

	    Meetup meetup = meetupRepository.findById(meetupId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "존재하지 않는 게시글입니다. MEETUPID: " + meetupId
	                    ));

	    if (meetup.getDeleteYn() == 'Y') {
	        throw new IllegalArgumentException("삭제된 게시글 입니다.");
	    }

	    // 비공개 모집글 접근 권한 확인
	    if (Boolean.TRUE.equals(meetup.getHidden())) {

	        // 작성자 여부
	        boolean isOwner = memberId != null
	                && meetup.getMember().getId().equals(memberId);

	        // 관리자 여부
	        boolean isAdmin = false;

	        if (memberId != null) {

	            Member member = memberRepository.findById(memberId)
	                    .orElseThrow(() ->
	                            new ResourceNotFoundException("존재하지 않는 회원입니다."));

	            Long memberTypeId = member.getMemberType().getMemberTypeId();

	            isAdmin =
	                    MemberTypeEnum.ROLE_ADMIN.getId().equals(memberTypeId)
	                    || MemberTypeEnum.ROLE_SUPERADMIN.getId().equals(memberTypeId);
	        }

	        // 작성자도 아니고 관리자도 아니면 403
	        if (!isOwner && !isAdmin) {
	            throw new ResponseStatusException(
	                    HttpStatus.FORBIDDEN,
	                    "비공개 처리된 모집글입니다."
	            );
	        }
	    }
		
	    // 모임 개설자 ID
	    Long hostId = meetup.getMember().getId();
		
		Long hostMeetupCount =
		        meetupRepository.countByMemberIdAndDeleteYn(
		        		hostId,
		                'N'
		        );
		
		// 완료 횟수
		Long completedMeetupCount =
		        meetupRepository.countByMemberIdAndMeetupStatusAndDeleteYn(
		        		hostId,
		                MeetupStatus.COMPLETED,
		                'N'
		        );
		
		// 노쇼 횟수
		Long noShowCount =
		        meetupApplicationRepository.countNoShowByMemberId(hostId);
		
		
		MeetupResponseDto response = MeetupResponseDto.detailFrom(meetup, memberId, hostMeetupCount, completedMeetupCount, noShowCount);	

		return response;
	}
	
	// 하루 등록한 모임 수 조회
	@Override
	public Long todayMeetupCount(Long memberId) {
		
		//하루모임 3개제한
		ZoneId zoneId = ZoneId.of("Asia/Seoul");
		
		//서버시간기준
        LocalDate today = LocalDate.now(zoneId);
        
        //오늘 00시
        LocalDateTime startOfDay =
                today.atStartOfDay();
        //다음날 00시
        LocalDateTime startOfNextDay =
                today.plusDays(1).atStartOfDay();   
        
        return meetupRepository.countTodayCreatedMeetups(
                memberId,
                startOfDay,
                startOfNextDay
        );
	}
	
	//모임등록
	@Transactional
	@Override
	public void create(MeetupRequestDto meetupRequestDto, Long memberId, List<MultipartFile> files){
		Member member = memberRepository.findById(memberId)
										.orElseThrow(()-> new ResourceNotFoundException("존재하지 않는 회원입니다. MEMBERID" + memberId));
		
		Sigungu sigungu = meetupSigunguRepository.findById(meetupRequestDto.getSigunguId()).orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 지역입니다. SigunguId" + meetupRequestDto.getSigunguId()));
		MeetupCategory meetupCategory = meetupCategoryRepository.findById(meetupRequestDto.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 카테고리입니다. meetupCategory" + meetupRequestDto.getCategoryId()));

        long todayCount = todayMeetupCount(memberId);
		
        if (todayCount >= 3) {
            throw new IllegalArgumentException(
                    "하루 최대 3개의 모임만 등록할 수 있습니다."
            );
        }
        
	    Meetup meetup = Meetup.builder()
							  .title(meetupRequestDto.getTitle())
							  .content(meetupRequestDto.getContent())
							  .maxParticipants(meetupRequestDto.getMaxParticipants())
							  .minParticipants(meetupRequestDto.getMinParticipants())
							  .sigungu(sigungu)
							  .meetupCategory(meetupCategory)
							  .address(meetupRequestDto.getAddress())
							  .addressDetail(meetupRequestDto.getAddressDetail())
							  .meetupAt(meetupRequestDto.getMeetupAt())
							  .meetupStatus(meetupRequestDto.getMeetupStatus())
							  .latitude(meetupRequestDto.getLatitude())
							  .longitude(meetupRequestDto.getLongitude())
							  .nx(meetupRequestDto.getNx())
							  .ny(meetupRequestDto.getNy())
							  .member(member)
							  .build();
		meetupRepository.save(meetup);
		try {
			if(files != null && !files.isEmpty()) {
				for(MultipartFile file : files) {
					String savedFileName = utilUpload.fileUpload(file, "meetup");
					
					Image image = Image.builder()
					        .imagePath(savedFileName)
					        .build();
					
					MeetupImage meetupImage = MeetupImage.builder()
					        .meetup(meetup)
					        .image(image)
					        .build();
					imageRepository.save(image);
					meetupImageRepository.save(meetupImage);
				}
			}
		}catch(IOException e) {
			throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다.", e);
		}		
	}

	// 모임 수정
	@Transactional
	@Override
	public void update(
	        MeetupRequestDto meetupRequestDto,
	        Long meetupId,
	        List<MultipartFile> files,
	        List<String> existingImagePaths,
	        Long memberId
	) {
		
	    Meetup meetup = meetupRepository.findByIdAndMemberId(meetupId, memberId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "존재하지 않는 모임이거나 접근 권한이 없습니다. MEETUPID" + meetupId
	                    )
	            );
	    
	    if (meetup.getDeleteYn() == 'Y') {
	        throw new ResourceNotFoundException(
	                "삭제된 게시글 입니다. MEETUPID" + meetupId
	        );
	    }
	    
	    Sigungu sigungu = meetupSigunguRepository.findById(
	            meetupRequestDto.getSigunguId()
	    ).orElseThrow(() ->
	            new ResourceNotFoundException(
	                    "존재하지 않는 지역입니다. SigunguId"
	                            + meetupRequestDto.getSigunguId()
	            )
	    );

	    MeetupCategory meetupCategory = meetupCategoryRepository.findById(
	            meetupRequestDto.getCategoryId()
	    ).orElseThrow(() ->
	            new ResourceNotFoundException(
	                    "존재하지 않는 카테고리입니다. meetupCategory"
	                            + meetupRequestDto.getCategoryId()
	            )
	    );

	    // 기존 개설상태
	    MeetupStatus previousStatus = meetup.getMeetupStatus();
	    
	    // =========================
	    // 모임 정보 수정
	    // =========================
	    meetup.setTitle(meetupRequestDto.getTitle());
	    meetup.setContent(meetupRequestDto.getContent());
	    meetup.setMaxParticipants(meetupRequestDto.getMaxParticipants());
	    meetup.setMinParticipants(meetupRequestDto.getMinParticipants());
	    meetup.setSigungu(sigungu);
	    meetup.setMeetupCategory(meetupCategory);
	    meetup.setAddress(meetupRequestDto.getAddress());
	    meetup.setAddressDetail(meetupRequestDto.getAddressDetail());
	    meetup.setMeetupAt(meetupRequestDto.getMeetupAt());
	    meetup.setMeetupStatus(meetupRequestDto.getMeetupStatus());
	    meetup.setLatitude(meetupRequestDto.getLatitude());
	    meetup.setLongitude(meetupRequestDto.getLongitude());
	    meetup.setNx(meetupRequestDto.getNx());
	    meetup.setNy(meetupRequestDto.getNy());
	    
	    // =========================
	    // 모임 완료 시 신청승인 상태의 참여자에게만 신뢰도 +10 
	    // 신뢰도 점수는 7일에 한번만 증가
	    // =========================
	    if (previousStatus != MeetupStatus.COMPLETED
	            && meetupRequestDto.getMeetupStatus() == MeetupStatus.COMPLETED) {

	        meetup.getMeetupApplications().stream()
	                .filter(meetupApplications ->
	                meetupApplications.getApplyStatus() == ApplyStatus.APPROVED)
	                .forEach(meetupApplications -> {
	                	
	                	Member member = meetupApplications.getMember();
	                	String key = TRUST_SCORE_KEY_PREFIX + member.getId();
	                    // 최근 7일 이내 모임 완료 보상 여부 확인
	                    if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
	                        return;
	                    }

	                    // 신뢰도 +10
	                    changeTrustScore(member, 10);

	                    // Redis 7일 저장
	                    redisTemplate.opsForValue().set(
	                            key,
	                            "1",
	                            7,
	                            TimeUnit.DAYS
	                    );	                	
	                });
	    }
	    
		 // =========================
		 // 기존 이미지 삭제
		 // =========================

		 List<String> keepImagePaths = (existingImagePaths != null) ? existingImagePaths : new ArrayList<>();
	
		 // 삭제해야 할 MeetupImage 추출
		 List<MeetupImage> removeMeetupImages = meetup.getMeetupImages()
		         .stream()
		         .filter(meetupImage -> !keepImagePaths.contains(meetupImage.getImage().getImagePath()))
		         .toList();
	
		 for (MeetupImage meetupImage : removeMeetupImages) {
		     Image image = meetupImage.getImage();
	
		     // 1. 실제 로컬/S3 파일 삭제
		     utilUpload.fileDelete(image.getImagePath(), "meetup");
	
		     // 2. 부모 자식 관계 명시적 제거 (메모리동기화)
		     meetup.getMeetupImages().remove(meetupImage);
	
		     // 3. DB 삭제 (MeetupImage 우선 삭제 -> Image 삭제)
		     meetupImageRepository.delete(meetupImage);
		     imageRepository.delete(image);
		 }


	    // =========================
	    // 새 이미지 추가
	    // =========================

	    if (files != null && !files.isEmpty()) {

	        try {

	            for (MultipartFile file : files) {

	                String savedFileName =
	                        utilUpload.fileUpload(file, "meetup");

	                Image image = Image.builder()
	                        .imagePath(savedFileName)
	                        .build();

	                imageRepository.save(image);

	                MeetupImage meetupImage =
	                        MeetupImage.builder()
	                                .meetup(meetup)
	                                .image(image)
	                                .build();

	                meetupImageRepository.save(meetupImage);
	            }

	        } catch (IOException e) {

	            throw new RuntimeException(
	                    "이미지 업로드 중 오류가 발생했습니다.",
	                    e
	            );
	        }
	    }
	}
	
	//모임삭제
	@Transactional
	@Override
	public void delete(Long meetupId, Long memberId) {
		
	    Meetup meetup = meetupRepository.findByIdAndMemberId(meetupId, memberId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "존재하지 않는 모임이거나 접근 권한이 없습니다. MEETUPID" + meetupId
	                    )
	            );
	    
	    // 이미 삭제된 모임인지 확인
	    if (meetup.getDeleteYn() == 'Y') {
	        throw new ResourceNotFoundException(
	                "이미 삭제된 모임입니다. MEETUPID" + meetupId
	        );
	    }
		meetup.setDeleteYn('Y'); //저장메서드를 따로 호출하지 않아도 delete 쿼리 반영 더티체킹(Dirty Checking)		
	}
	
	//모임신청
	@Transactional
	@Override	
	public void apply(Long memberId, Long meetupId) {
		Meetup meetup = meetupRepository.findById(meetupId)
										.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 게시글입니다. MEETUPID" + meetupId));
		
		Member member = memberRepository.findById(memberId)
										.orElseThrow(()-> new ResourceNotFoundException("존재하지 않는 회원입니다.. MEMBERID" + memberId));
			
		Optional<MeetupApplication> apply = meetupApplicationRepository.findByMeetup_IdAndMember_Id(meetupId, memberId);
		
	    // 오늘 날짜 (한국 시간)
	    ZoneId zoneId = ZoneId.of("Asia/Seoul");
	    LocalDate today = LocalDate.now(zoneId);
	    LocalDateTime now = LocalDateTime.now(zoneId);
		
	    // 이미 신청했으면 → 신청 취소
	    if (apply.isPresent()) {	    	
	    	MeetupApplication meetupApplication = apply.get();

	        // 신청 중이면 → 취소
	        if (meetupApplication.getApplyStatus() == ApplyStatus.PENDING) {
	        	
	        	/* 오늘 신청한 모임을 1시간 초과 후 취소하면 -5점 */
	            
	        	// 신청한 날짜가 오늘인지 확인
	            boolean isTodayApplication =
	                    meetupApplication.getCreatedAt()
	                            .toLocalDate()
	                            .isEqual(today);
	        	
	            // 신청 후 경과 시간
	            long elapsedMinutes =
	                    ChronoUnit.MINUTES.between(
	                            meetupApplication.getCreatedAt(),
	                            now
	                    );
	            
	            // 오늘 신청 + 신청 후 1시간 초과 → 신뢰도 -5점
	            if (isTodayApplication && elapsedMinutes > 60) {
	                changeTrustScore(member, -5);
	            }

	            meetupApplication.setApplyStatus(ApplyStatus.CANCELED);
	            return;
	        }

	        // 취소된 상태면 → 다시 신청
	        if (meetupApplication.getApplyStatus() == ApplyStatus.CANCELED) {

	            long applicantCount =
	                    meetupApplicationRepository
	                            .countByMeetupIdAndApplyStatus(
	                                    meetupId,
	                                    ApplyStatus.PENDING
	                            );

	            if (applicantCount >= meetup.getMaxParticipants()) {
	                throw new IllegalStateException(
	                        "모임 정원이 가득 찼습니다."
	                );
	            }

	            meetupApplication.setApplyStatus(ApplyStatus.PENDING);
	            return;
	        }
	    }
	    
	    // 신규 신청 → 정원 확인
	    long applicantCount =
	            meetupApplicationRepository.countByMeetupIdAndApplyStatus(
	                    meetupId,
	                    ApplyStatus.PENDING
	            );
	    
	    if (applicantCount >= meetup.getMaxParticipants()) {
	        throw new IllegalStateException("모임 정원이 가득 찼습니다.");
	    }
	    
	    // AI 한줄평이 없는 경우 최초 생성
	    if (member.getMemberInfo().getAiSummary() == null) {
	        updateAiSummary(member);
	    }
	    
	    // 신청 내역 자체가 없으면 → 신규 신청
		MeetupApplication meetupApplication = MeetupApplication.builder()
															   .applyStatus(ApplyStatus.PENDING)
															   .meetup(meetup)
															   .member(member)
															   .build();
		
		meetupApplicationRepository.save(meetupApplication);
	}
	
	//좋아요
	@Override
	public void meetupLike(Long memberId, Long meetupId) {
		
		boolean exists = meetupLikesRepository.existsByMember_IdAndMeetup_Id(memberId, meetupId);
		
		//이미 좋아요 했으면 삭제
		if(exists) {
			meetupLikesRepository.deleteByMember_IdAndMeetup_Id(memberId, meetupId);
			return;
		}		
		
		Meetup meetup = meetupRepository.findById(meetupId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 게시글입니다. MEETUPID" + meetupId));

		Member member = memberRepository.findById(memberId)
				.orElseThrow(()-> new ResourceNotFoundException("존재하지 않는 회원입니다. MEMBERID" + memberId));
		
		//없으면 저장
		MeetupLike meetupLike = MeetupLike.builder()
										  .meetup(meetup)
										  .member(member)
										  .build();
		
		meetupLikesRepository.save(meetupLike);	
	}
	
	//모집글 비공개(관리자)
	@Transactional
	@Override	
	public void changeMeetupVisibility(Long meetupId) {
		
		Meetup meetup = meetupRepository.findById(meetupId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 게시글입니다. MEETUPID" + meetupId));

			meetup.setHidden(!meetup.getHidden());
	}
	
	//마이페이지 내가 신청한 모집글 목록 조회(페이징)
	@Override
	public MyApplicationListResponseDto getMyApplications(Long memberId, Pageable pageable) {
		
	    Page<MeetupApplication> page = meetupApplicationRepository.findByMember_IdOrderByUpdatedAtDesc(memberId, pageable);

	    MyApplicationListResponseDto response =
	            new MyApplicationListResponseDto();

	    response.setTotalCount(page.getTotalElements());
	    response.setTotalPage((long) page.getTotalPages());

	    List<MeetupApplicationResponseDto> applications =
	            page.getContent()
	                    .stream()
	                    .map(MeetupApplicationResponseDto::fromEntity)
	                    .toList();
	    response.setApplications(applications);

	    return response;
	}

	//마이페이지 내 모집글 신청자 리스트(페이징)
	@Override
	public MeetupApplyMemberListResponseDto getMyMeetupApplicants(Long meetupId, Long memberId, Pageable pageable) {

		List<ApplyStatus> excludedStatuses = List.of(
				ApplyStatus.CANCELED,
				ApplyStatus.CANCEL_LAST_MINUTE
		);	
		
		Page<MeetupApplication> page = meetupApplicationRepository.findByMeetup_IdAndMeetup_Member_IdAndApplyStatusNotIn(
																	meetupId, memberId, excludedStatuses, pageable);
		
		MeetupApplyMemberListResponseDto response = new MeetupApplyMemberListResponseDto();
		
	    response.setTotalCount(page.getTotalElements());
	    response.setTotalPage((long) page.getTotalPages());
	    
	    List<MeetupApplicantResponseDto> list =
	            page.getContent()
	                .stream()
	                .map(MeetupApplicantResponseDto::fromEntity)
	                .toList();
	    
	    response.setApplicants(list);

		return response;
	}

	//마이페이지 내가 모집한 모집글 조회(페이징)
	@Override
	public MeetupListResponseDto getMyMeetups(Long memberId, Pageable pageable) {
		Page<Meetup> page = meetupRepository.findByMember_IdAndDeleteYnOrderByCreatedAtDesc(memberId, 'N', pageable);
		
		List<MeetupResponseDto> meetups = page.getContent()
											.stream()
											.map(MeetupResponseDto::listFrom)
											.toList();
		//현재 페이지에서 조회된 모임 id
		List<Long> ids = meetups.stream()
				.map(MeetupResponseDto::getId)
				.toList();
		
		//모임별 승인된 신청자 수 조회
		
		if(!ids.isEmpty()) {
			List<MeetupParticipantCountDto> result = 
					meetupApplicationRepository.countByMeetup_IdInAndApplyStatusAndDeleteYn(ids, ApplyStatus.APPROVED, 'N');
			
			meetups.forEach(item->{
				result.stream()
					.filter(cnt-> item.getId().equals(cnt.getMeetupId()))
					.findFirst()
					.ifPresent(cnt ->
						item.setTotalParticipants(cnt.getTotalParticipants())
					);
			});			
		}
		
		MeetupListResponseDto response = new MeetupListResponseDto();

	    response.setTotalCount(page.getTotalElements());
	    response.setTotalPage((long) page.getTotalPages());
	    response.setMeetups(meetups);
	    
		return response;
	}	
	
	//마이페이지 승인, 거절(거절사유), 노쇼 처리
	@Transactional
	@Override
	public void updateApplicationStatus(MeetupApplicationRequestDto requestDto) {
		
		MeetupApplication meetupApplication = meetupApplicationRepository.findById(requestDto.getApplicationId())
																		.orElseThrow(() ->
													                    new ResourceNotFoundException(
													                            "존재하지 않는 신청입니다. APPLICATION ID : " 
													                            + requestDto.getApplicationId()
													                        ));
		Member member = meetupApplication.getMember();
		
		//기존 상태
		ApplyStatus beforeStatus = meetupApplication.getApplyStatus();
		
		//받아온 상태
		ApplyStatus afterStatus = requestDto.getApplyStatus();
		
		meetupApplication.setApplyStatus(requestDto.getApplyStatus());
		
		//거절일 경우 거절 사유 저장
		if(requestDto.getApplyStatus() == ApplyStatus.REJECTED) {
			meetupApplication.setRejectReason(requestDto.getRejectReason());
		}else{
			meetupApplication.setRejectReason(null);
		}
		
		if(beforeStatus != ApplyStatus.NOSHOW && afterStatus == ApplyStatus.NOSHOW) {
			//기존 상태가 NOSHOW가 아니고 → 새 상태가 NOSHOW일 때만 -5
    		changeTrustScore(member, -5);
		}else if(beforeStatus == ApplyStatus.NOSHOW && afterStatus != ApplyStatus.NOSHOW) {
			//NOSHOW에서 다른 상태로 변경 (실수로 누른경우)
			changeTrustScore(member, 5);
		}		
	}
	
	//카테고리 조회
	@Override
	public List<MeetupCategoryDto> getCategory() {
		List<MeetupCategory> meetupCategory =  meetupCategoryRepository.findAll();
		
//		List<CategoryDto> result = meetupCategory.stream()
//				.map(cate->{
//			CategoryDto dto = CategoryDto.from(cate);
//			return dto;
//		}).toList();
		
		
		//아이디만 담으려고하면
//		List<Long> result = meetupCategory.stream()
//				.map(cate->{
//			return cate.getId();
//		}).toList();
		
//		List<CategoryDto> result =   meetupCategory.stream()
//		.filter(cate->{
//			return cate.getId() != 1L;
//		})
//		.map(CategoryDto::from)
//		.toList();

		return meetupCategory.stream().map(MeetupCategoryDto::from).toList();	
	}
	
	//시군구 조회
	@Override
	public List<SigunguDto> getSigungu() {
		
		List<Sigungu> sigungu = meetupSigunguRepository.findAll();
		
		return sigungu.stream().map(SigunguDto::from).toList();
	}
	
	//마이페이지 - 통계
	@Override
	public MyMeetupCountResponseDto getMyMeetupCount(Long memberId) {

	    return meetupRepository.getMyMeetupCount(memberId);
	}
	
	//관리자 - 통계
	@Override
	public MeetupCountResponseDto getMeetupCount() {
		return meetupRepository.getMeetupCount();
	}
	
	//인기모임
	@Override
	public List<PopularMeetupResponseDto> getPopularMeetups(Long memberId) {

	    Pageable pageable = PageRequest.of(0, 4);

	    // 좋아요 수 기준 인기 모임 4개
	    List<PopularMeetupResponseDto> list =
	            meetupRepository.findPopularMeetups(pageable);
	    
	    // 인기 모임 ID 추출
	    List<Long> meetupIds = list.stream()
	            .map(PopularMeetupResponseDto::getId)
	            .toList();
	    
	    // 로그인 사용자라면 내가 좋아요했는지 조회
	    if (memberId != null && !meetupIds.isEmpty()) {

	        List<MeetupLikeDto> likeResult =
	                meetupLikesRepository.findLikedMeetups(
	                        meetupIds,
	                        memberId
	                );
	        
	        // hasLike 세팅
	        list.forEach(meetup -> {

	            boolean hasLike = likeResult.stream()
	                    .anyMatch(like ->
	                            like.getMeetupId().equals(meetup.getId())
	                    );

	            meetup.setHasLike(hasLike);
	        });
	    }

	    return list;
	}
	
	// 추천모임
	@Override
	public List<MeetupResponseDto> getRecommendedMeetups(Long memberId, Long meetupId) {
	    Pageable pageable = PageRequest.of(0, 3);

	    List<Meetup> recommended;

	    // 로그인한 회원 → 관심사 기반 추천
	    if (memberId != null) {
	        recommended = meetupRepository.findRecommendedMeetups(
	                memberId,
	                meetupId,
	                pageable
	        );
	    } else {
	        // 비로그인 → 전체 랜덤
	        recommended = meetupRepository.findRandomMeetups(
	                meetupId,
	                pageable
	        );
	    }

	    // 관심사에 맞는 모임이 없으면 전체 랜덤
	    if (recommended.isEmpty()) {
	        recommended = meetupRepository.findRandomMeetups(
	                meetupId,
	                pageable
	        );
	    }
	    return recommended.stream()
	            .map(MeetupResponseDto::listFrom)
	            .toList();	    
	}
	
	//모임끌어올리기
	@Transactional
	@Override
	public void boostMeetup(Long memberId, Long meetupId) {
		
        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "존재하지 않는 회원입니다. MEMBERID" + memberId
                        )
                );
        // 모임 조회
        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "존재하지 않는 모임입니다. MEETUPID" + meetupId
                        )
                );
        
        // 모임 개설자 본인 확인
        if(!meetup.getMember().getId().equals(memberId)) {
        	throw new IllegalStateException("모임 개설자만 끌어올리기 할 수 있습니다.");
        }
        
        // Redis에서 최근 7일 이내 끌어올리기 여부 확인
        String key = BOOST_KEY_PREFIX + meetupId;

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            throw new IllegalStateException(
                    "최근 7일 이내 이미 끌어올린 모임입니다."
            );
        }
        
        // 회원 포인트 확인
        MemberInfo memberInfo = member.getMemberInfo();
        
        if(memberInfo.getPoint() < BOOST_POINT) {
        	throw new IllegalStateException(
                    "포인트가 부족합니다."
            );
        }

        // 포인트 차감
        memberInfo.setPoint(memberInfo.getPoint() - BOOST_POINT);
        
     // PointHistory 저장
        PointHistory pointHistory = new PointHistory();
        pointHistory.setMember(member);
        pointHistory.setPointPm(-BOOST_POINT);
        pointHistory.setPointType("USE");
        pointHistory.setPointReason("MEETUP_BOOST");
        
        pointHistoryRepository.save(pointHistory);
        
        // MeetupBoost 저장
        MeetupBoost meetupBoost = MeetupBoost.builder()
        									 .meetup(meetup)
        									 .pointHistory(pointHistory)
        									 .endDate(LocalDate.now().plus(7, ChronoUnit.DAYS))
        									 .build();
        
        meetupBoostRepository.save(meetupBoost);  
        
        // Redis 7일동안 저장
        redisTemplate.opsForValue().set(key, "1", 7, TimeUnit.DAYS);
        
        /*
        key             → 저장할 Redis Key "meetup:boost:10"
		"1"             → 저장할 Value
		7               → 만료 시간
		TimeUnit.DAYS   → 7의 단위 = 일  
        */
	}
	
	// ################### open api ###################

	//ai 제목/카테고리/컨텐츠 추가
	@Override
	public RecommendMeetupResponseDto meetupWriteAiRecommended(RecommendMeetupRequestDto request){
		String keyword = request.getKeyword();
		String aiPrompt = """
				사용자가 입력한 키워드를 바탕으로 많이 모을수 있는, 재미있는, 사용자들이 클릭하고 싶은 모임 정보를 생성해.
				category는 웬만해서 입력한 키워드로 해줘. 
				
				키워드: %s

				아래 JSON 형식으로만 응답해.

				{
				  "title": "",
				  "category": "",
				  "content": ""
				}

				JSON 외의 다른 설명은 절대 하지 마.
				""".formatted(keyword);
	    try {
	    	// 1. AI 호출
			String result = openAiApiClient.getAIResponse(aiPrompt);
			
			// 2. AI 응답 JSON → DTO
			ObjectMapper mapper = new ObjectMapper();
			RecommendMeetupResponseDto dto =
			        mapper.readValue(result, RecommendMeetupResponseDto.class);
			
			// 3. 카테고리 이름 → 카테고리 ID
			Long categoryId = getCategory()
								.stream()
								.filter(category -> category.getCategoryName().equals(dto.getCategory()))
								.map(MeetupCategoryDto::getId)
								.findFirst()
								.orElse(0L);
			
			dto.setCategoryId(categoryId == null ? 0 : categoryId);
	
	
	        return dto;
	
	    } catch (Exception e) {
	        throw new RuntimeException("AI 모임 추천 생성 중 오류가 발생했습니다.", e);
	    }
	}
	
	// 점수가 실제로 변경된 경우에만 AI 요약 갱신
	private void changeTrustScore(Member member, int amount) {

	    MemberInfo memberInfo = member.getMemberInfo();

	    int currentScore = memberInfo.getTrustScore();

	    int newScore = Math.max(
	            0,
	            Math.min(100, currentScore + amount)
	    );

	    memberInfo.setTrustScore(newScore);

	    // 점수가 실제로 변경된 경우에만 AI 요약 갱신
	    if (currentScore != newScore) {
	        updateAiSummary(member);
	    }
	}
	
	// 신뢰도 점수 AI 요약 갱신
	private void updateAiSummary(Member member) {

	    Integer trustScore = member.getMemberInfo().getTrustScore();

	    String aiSummary;

	    if (trustScore < 60) {

	        String aiPrompt = "[대상 유저 이력 정보]\n"
	                + "- 최근 3개월 내 무단 노쇼(NOSHOW), 당일 모임 신청 후 1시간 이내 취소 등의 이력을 종합\n"
	                + "- 총 신뢰도 점수: " + trustScore + "점\n"
	                + "- 신뢰도 점수가 60점 이하면 주의가 필요한 회원\n"
	                + "위 이력을 바탕으로 모임 개설자가 주의할 수 있게 "
	                + "20자 내외의 경고성 한 줄 요약문을 만들어줘.";

	        aiSummary = openAiApiClient.getAIResponse(aiPrompt);

	    } else {
	        aiSummary = "신뢰도가 높은 회원입니다.";
	    }

	    member.getMemberInfo().setAiSummary(aiSummary);
	}
	
	// 날씨 알림 sms
	@Override
	@Transactional
	public void sendTomorrowWeatherNotification() {

	    // 내일 날짜 구하기
	    LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Seoul")).plusDays(1);

	    // 내일의 시작 시간(00:00:00) 구하기
	    LocalDateTime start = tomorrow.atStartOfDay();

	    // 모레 시작 시간
	    LocalDateTime end = tomorrow.plusDays(1).atStartOfDay();

	    // 내일 모임 조회
	    List<Meetup> meetups = meetupRepository.findTomorrowMeetups(start, end);

	    // 같은 지역(nx, ny)의 날씨 API 중복 호출 방지
	    Map<String, WeatherInfoResponse> weatherCache = new HashMap<>();

	    // 해당 모임 날씨 조회
	    for (Meetup meetup : meetups) {

	        // 날씨 정보 요청
	        WeatherInfoRequest request = new WeatherInfoRequest();

	        request.setNx(meetup.getNx());
	        request.setNy(meetup.getNy());

	        // 비 예보 확인
	        request.setMeetupDate(
	                meetup.getMeetupAt()
	                      .toLocalDate()
	                      .format(DateTimeFormatter.ofPattern("yyyyMMdd"))
	        );

	        request.setMeetupTime(meetup.getMeetupAt().getHour());

	        // nx + ny를 지역 캐시 키로 사용
	        String cacheKey = request.getNx() + "_" + request.getNy();
	        
	        // 캐시에서 꺼냄
	        WeatherInfoResponse weather = weatherCache.get(cacheKey);

	        // 캐시에 없으면 API 호출
	        if (weather == null) {
	            try {
	            	
	                weather = openApiService.getWeathreInfo(request);
	                
	                //캐시에 저장
	                weatherCache.put(cacheKey, weather);
	                
	            } catch (Exception e) {
	            	log.error("날씨 조회 실패 - meetupId: " + meetup.getId() + ", error: " + e.getMessage());
	                continue;
	            }
	        }

	        // 강수확률 확인 (null 체크로 NPE 방지)
	        if (weather.getPop() == null || weather.getPop() < 50) { // 강수확률 50%이상 문자발송
	            continue;
	        }

	        // 이 모임에 대해 이미 알림 보낸 참여자 ID를 한 번에 조회 (참여자별 개별 쿼리 방지)
	        Set<Long> alreadyNotifiedMemberIds;
	        try {
	            alreadyNotifiedMemberIds = meetupNotificationRepository
	                    .findByMeetupAndMeetupNotificationType(meetup, MeetupNotificationType.RAIN)
	                    .stream()
	                    .map(n -> n.getMember().getId())
	                    .collect(Collectors.toSet());
	        } catch (Exception e) {
	        	log.error("알림 이력 조회 실패 - meetupId: " + meetup.getId() + ", error: " + e.getMessage());
	            continue;
	        }

	        // 승인된 참여자에게 SMS 발송
	        for (MeetupApplication application : meetup.getMeetupApplications()) {

	            // 승인된 참여자가 아니면 continue
	            if (application.getApplyStatus() != ApplyStatus.APPROVED) {
	                continue;
	            }

	            Member member = application.getMember();

	            // 이미 이 모임에 대해 날씨 알림을 보냈으면 스킵 (중복 발송 방지)
	            if (alreadyNotifiedMemberIds.contains(member.getId())) {
	                continue;
	            }

	            DateTimeFormatter smsDateFormatter = DateTimeFormatter.ofPattern("M/d(E) HH:mm", Locale.KOREAN); 
	            
	            String mobile = member.getMobile();
	            String messageText =
	                    "☔ [MOIT 날씨 알림]\n"
	                  + "[" + meetup.getMeetupCategory().getCategoryName() + "] " + meetup.getMeetupAt().format(smsDateFormatter) + "\n"
	                  + "내일 비소식이 있습니다.\n"
	                  + "모임 참여 시 참고하세요.\n"
	                  + "강수확률: " + weather.getPop() + "%\n";

	            // 참여자 한 명 SMS 발송 실패해도 나머지는 계속 발송되도록 개별 try-catch
	            MeetupNotificationSendStatus status;
	            try {
	                SolapiSmsRequestDto smsRequest = new SolapiSmsRequestDto();
	                smsRequest.setPhoneNumber(mobile);
	                smsRequest.setMessage(messageText);

	                openApiService.sendSms(smsRequest);
	                status = MeetupNotificationSendStatus.SENT;

	            } catch (Exception e) {
	                status = MeetupNotificationSendStatus.FAILED;
	                log.error("SMS 발송 실패 - memberId: " + member.getId() + ", error: " + e.getMessage());
	            }

	            // 저장 실패가 SMS 발송(위 블록)에 영향 주지 않도록 별도 try-catch로 분리
	            try {
	                MeetupNotification notification = MeetupNotification.builder()
	                        .meetup(meetup)
	                        .member(member)
	                        .meetupNotificationType(MeetupNotificationType.RAIN)
	                        .phoneNumber(mobile)
	                        .message(messageText)
	                        .meetupNotificationSendStatus(status)
	                        .sentAt(status == MeetupNotificationSendStatus.SENT ? LocalDateTime.now() : null)
	                        .build();

	                meetupNotificationRepository.save(notification);

	            } catch (Exception e) {
	                log.error(
	                        "알림 이력 저장 실패 - memberId: {}, meetupId: {}, status: {}",
	                        member.getId(),
	                        meetup.getId(),
	                        status,
	                        e
	                    );
	            }
	        }
	    }
	    
	} // end sendTomorrowWeatherNotification
    
}
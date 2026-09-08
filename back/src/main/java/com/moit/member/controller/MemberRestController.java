package com.moit.member.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import com.moit.member.dao.LoginNotificationMapper;
import com.moit.member.dto.DeleteAccountRequestDto;
import com.moit.member.dto.LoginDeviceDto;
import com.moit.member.dto.LoginHistoryResponseDto;
import com.moit.member.dto.LoginRequestDto;
import com.moit.member.dto.LoginResponseDto;
import com.moit.member.dto.MyPageDto;
import com.moit.member.dto.NewDeviceNotificationDto;
import com.moit.member.dto.PointHistoryDto;
import com.moit.member.dto.RefreshRequestDto;
import com.moit.member.dto.RefreshResponseDto;
import com.moit.member.dto.ResetPasswordDto;
import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserRequestDto;
import com.moit.member.dto.UserResponseDto;
import com.moit.member.dto.UserUpdateRequestDto;
import com.moit.member.entity.PointHistory;
import com.moit.member.service.LoginDeviceService;
import com.moit.member.service.LoginHistoryService;
import com.moit.member.service.MemberService;
import com.moit.member.service.PointService;
import com.moit.member.service.VerificationService;
import com.moit.qna.service.NotificationService;
import com.moit.security.CustomUserDetails;
import com.moit.security.JwtTokenProvider;
import com.moit.security.PasswordLeakService;
import com.moit.security.RefreshTokenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberRestController {
	
	private final MemberService service;
	private final JwtTokenProvider jwtTokenProvider;
	private final PasswordEncoder passwordEncoder;
	private final RefreshTokenService refreshTokenService;
	private final PasswordLeakService passwordLeakService;
	private final VerificationService verificationService;
	private final LoginHistoryService loginHistoryService;
	private final LoginDeviceService loginDeviceService;
	private final PointService pointService;
	private final NotificationService notificationService;
	private final LoginNotificationMapper loginNotificationMapper;
	
	@Value("${resource.path}")
    private String resourcePath;
	
	//회원가입
	@Operation( summary = "회원가입", description = "새로운 회원을 등록합니다." )
    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(
            @RequestBody UserRequestDto  request) {

		UserDto dto = request.toUserDto();		

	    UserDto result = service.signup(dto);

	    return ResponseEntity
	    		.status(HttpStatus.CREATED)
	    		.body(UserResponseDto.from(result));
    }
	// 소셜 로그인 추가정보 조회
	@Operation( summary = "소셜 회원 추가정보 조회", description = "OAuth2 로그인 후 세션에 저장된 소셜 회원정보를 조회합니다." )
	@GetMapping("/social-info")
	public ResponseEntity<?> getSocialInfo(HttpSession session) {
		
	    UserDto socialUser = (UserDto) session.getAttribute("socialUser");

	    if (socialUser == null) {
	    	
	        return ResponseEntity
	                .status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of(
	                        "message",
	                        "소셜 회원가입 정보가 없습니다."
	                ));
	    }
	    

	    return ResponseEntity.ok(
	            Map.of(
	            		"email", socialUser.getEmail(),
	                    "nickname", socialUser.getNickname(),
	                    "provider", socialUser.getProvider(),
	                    "profileUrl",
	                    socialUser.getProfileUrl() == null
	                            ? ""
	                            : socialUser.getProfileUrl()
	            )
	    );
	}
	
	// 소셜 회원가입 추가정보 저장
	@Operation( summary = "소셜 회원가입 완료", description = "OAuth2 로그인 후 추가정보를 입력받아 회원가입을 완료하고 JWT를 발급합니다." )
	@PostMapping("/social-info")
	public ResponseEntity<?> socialSignup(
	        @RequestBody UserRequestDto request,
	        HttpSession session,
	        HttpServletRequest httpRequest) {

	    // 1. 세션에서 OAuth2 회원정보 가져오기
	    UserDto socialUser = (UserDto) session.getAttribute("socialUser");

	    if (socialUser == null) {
	        return ResponseEntity
	                .status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of(
	                        "message",
	                        "소셜 회원가입 정보가 만료되었거나 존재하지 않습니다."
	                ));
	    }
	    
	    // deviceId 확인
	    String deviceId = request.getDeviceId();

	    if (deviceId == null || deviceId.isBlank()) {

	        return ResponseEntity .badRequest() .body(Map.of( "message", "deviceId가 필요합니다." ));
	    }

	    // 2. 프론트에서 입력한 추가정보
	    UserDto dto = request.toUserDto();

	    // 3. OAuth2 로그인 정보 세팅
	    dto.setEmail(socialUser.getEmail());
	    dto.setProvider(socialUser.getProvider());
	    dto.setProviderId(socialUser.getProviderId());
	    dto.setProfileUrl(socialUser.getProfileUrl());

	    // 4. 소셜 회원가입
	    UserDto result = service.socialSignup(dto);

	    // 5. 실제 회원 ID
	    Long memberId = result.getMemberId();
	    
	    String ipAddress = httpRequest.getRemoteAddr();
	    String userAgent = httpRequest.getHeader("User-Agent");
	    
	    loginDeviceService.saveLoginDevice(
	            memberId,
	            deviceId,
	            ipAddress,
	            userAgent,
	            socialUser.getProvider().toUpperCase()
	    );

	    // 6. Access Token 발급
	    String accessToken =
	            jwtTokenProvider.createAccessToken(
	                    memberId,
	                    result.getLoginId(),
	                    deviceId
	            );

	    // 7. Refresh Token 발급
	    String refreshToken = jwtTokenProvider.createRefreshToken(memberId);

	    // 8. Redis에 Refresh Token 저장
	    refreshTokenService.saveRefreshToken(
	            memberId,
	            deviceId,
	            refreshToken,
	            jwtTokenProvider.getRefreshTokenExpiration()
	    );

	    // 9. 소셜 회원가입용 세션 삭제
	    session.removeAttribute("socialUser");

	    // 10. 응답
	    return ResponseEntity.ok(
	            new LoginResponseDto(
	                    accessToken,
	                    refreshToken,
	                    result.getMemberId(),
	                    result.getLoginId(),
	                    result.getMemberTypeId(),
	                    deviceId
	            )
	    );
	}
		
	// 아이디 중복검사
    @Operation( summary = "아이디 중복검사", description = "사용 중인 아이디인지 확인합니다." )
    @GetMapping("/check-loginId")
    public ResponseEntity<Boolean> checkLoginId(
            @Parameter(description = "확인할 아이디")
            @RequestParam("loginId") String loginId) {

        return ResponseEntity.ok( service.existsByLoginId(loginId) );
    }
    
    // 비밀번호 유출 여부 확인
    @Operation( summary = "비밀번호 유출 여부 확인", description = "HIBP API를 이용하여 비밀번호 유출 여부를 확인합니다." )
    @PostMapping("/check-password")
    public ResponseEntity<Map<String, Object>> checkPassword(
            @RequestBody Map<String, String> request) {

        String password = request.get("password");

        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "비밀번호를 입력해주세요."));
        }

        int leakCount = passwordLeakService.getLeakCount(password);

        if (leakCount == -1) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "비밀번호 보안 검증에 실패했습니다."));
        }

        return ResponseEntity.ok(
                Map.of("leaked", leakCount > 0,
                       "count", leakCount)
        );
    }

    // 이메일 중복검사
    @Operation( summary = "이메일 중복검사", description = "사용 중인 이메일인지 확인합니다." )
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(
            @Parameter(description = "확인할 이메일")
            @RequestParam("email") String email) {

        return ResponseEntity.ok( service.existsByEmail(email) );
    }

    // 닉네임 중복검사
    @Operation( summary = "닉네임 중복검사", description = "사용 중인 닉네임인지 확인합니다." )
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(
            @Parameter(description = "확인할 닉네임")
            @RequestParam("nickname") String nickname) {

        return ResponseEntity.ok( service.existsByNickname(nickname) );
    }
 
    // 로그인
    @Operation(
            summary = "로그인",
            description = "아이디, 비밀번호, 회원유형을 확인하고 JWT 발급"
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest
            ) {
    	
    	String deviceId = request.getDeviceId();
    	
        // 1. 아이디로 회원조회
        UserDto user = service.findByLoginId(request.getLoginId());

        // 2. 회원이 존재하지 않는 경우
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }
        
        // 3. 비밀번호 확인
        boolean passwordMatch = passwordEncoder.matches( request.getPassword(), user.getPassword() );

        // 4. 비밀번호 틀린 경우
        if (!passwordMatch) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

	    // 5. 회원 상태 확인
	    // 승인 대기
	    if (user.getStatusId() != null && user.getStatusId().equals(2L)) {
	
	        return ResponseEntity
	                 .status(HttpStatus.FORBIDDEN)
	                 .body(Map.of( "message", "관리자 승인 대기중입니다." ));
	    }
	
	    // 탈퇴 / 정지 / 기타 비활성 상태
	    if (user.getStatusId() == null || !user.getStatusId().equals(1L)) {
	
	        return ResponseEntity
	                 .status(HttpStatus.UNAUTHORIZED)
	                 .body(Map.of( "message", "로그인할 수 없는 회원입니다." ));
	    }
       
	    // 6. 회원 유형 확인
	    Long userMemberTypeId = user.getMemberTypeId();
	    Long requestMemberTypeId = request.getMemberTypeId();

	    // 관리자 로그인
	    if (requestMemberTypeId == null) {

	        // 관리자(3) 또는 최고관리자(4)만 허용
	        if (userMemberTypeId == null ||
	            (userMemberTypeId != 3L && userMemberTypeId != 4L)) {

	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of( "message", "관리자 계정만 로그인할 수 있습니다." ));
	        }
	    }
	    // 일반회원 / 제휴업체 로그인
	    else {
	        if (userMemberTypeId == null || !userMemberTypeId.equals(requestMemberTypeId)) {

	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of( "message", "회원유형이 맞지 않습니다." ));
	        }
	    }
	    
	    // 로그인 기록 저장
	    String ipAddress = httpRequest.getRemoteAddr();
	    String userAgent = httpRequest.getHeader("User-Agent");

		 // =========================================================
		 // 새로운 로그인 기기인지 확인
		 // =========================================================
	
		 boolean isNewDevice =
		         !loginDeviceService.existsLoginDevice(
		                 user.getMemberId(),
		                 deviceId
		         );
	
		 // =========================================================
		 // 로그인 기록 저장
		 // =========================================================
	
		 loginHistoryService.saveLoginHistory(
		         user.getMemberId(),
		         ipAddress,
		         userAgent,
		         "NORMAL"
		 );
	
		 // =========================================================
		 // 새로운 기기 로그인 알림
		 // =========================================================
	
		 if (isNewDevice) {
			 
		     NewDeviceNotificationDto notification =
		             new NewDeviceNotificationDto();
	
		     notification.setMemberId(user.getMemberId());
	
		     notification.setMessage(
		             "새로운 기기에서 로그인되었습니다. "
		             + "IP: " + ipAddress
		     );
	
		     try {
	
		         loginNotificationMapper
		                 .insertNewDeviceNotification(notification);		      
		         
		     } catch (Exception e) {
	
		         // 알림 저장 실패 때문에 로그인 자체가 실패하지 않도록 처리
		    	 log.error("새로운 기기 로그인 알림 저장 실패: {}", e.getMessage(), e);
		     }
		 }
	
		 // =========================================================
		 // 로그인 기기 저장
		 // =========================================================
	
		 loginDeviceService.saveLoginDevice(
		         user.getMemberId(),
		         deviceId,
		         ipAddress,
		         userAgent,
		         "NORMAL"
		 );

        // 7. Access Token 생성
        String accessToken =
                jwtTokenProvider.createAccessToken(
                        user.getMemberId(),
                        user.getLoginId(),
                        deviceId
                );

        // 8. Refresh Token 생성
        String refreshToken =
                jwtTokenProvider.createRefreshToken(
                        user.getMemberId()
                );

        // 9. Refresh Token Redis 저장
        refreshTokenService.saveRefreshToken(
                user.getMemberId(),
                deviceId,
                refreshToken,
                jwtTokenProvider.getRefreshTokenExpiration()
        );

        // 10. Refresh Token HttpOnly Cookie 생성
        ResponseCookie refreshTokenCookie =
                ResponseCookie.from("refreshToken", refreshToken)
                        .httpOnly(true)
                        .secure(false)       // 로컬 개발환경: HTTP
                        .path("/")
                        .maxAge(jwtTokenProvider.getRefreshTokenExpiration() / 1000)
                        .sameSite("Lax")
                        .build();

        // 11. 로그인 응답
        LoginResponseDto response =
                new LoginResponseDto(
                        accessToken,
                        null, // Refresh Token은 Cookie로 이동
                        user.getMemberId(),
                        user.getLoginId(),
                        user.getMemberTypeId(),
                        deviceId
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString()
                )
                .body(response);
    }
    
    // Access Token 재발급
    @Operation(
            summary = "Access Token 재발급",
            description = "Refresh Token을 검증하여 새로운 Access Token과 Refresh Token을 발급합니다."
    )
    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDto> refresh(
    		@CookieValue(value = "refreshToken", required = false)
            String refreshToken,
            @RequestBody RefreshRequestDto request) {

    	String deviceId =
                request.getDeviceId();


        // =====================================================
        // Refresh Token 존재 여부 확인
        // =====================================================
        if (
            refreshToken == null ||
            refreshToken.isBlank()
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // Device ID 확인
        // =====================================================
        if (
            deviceId == null ||
            deviceId.isBlank()
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // Refresh Token JWT 검증
        // =====================================================
        if (
            !jwtTokenProvider
                .validateToken(refreshToken)
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // Refresh Token 타입 확인
        // =====================================================
        if (
            !"REFRESH".equals(
                jwtTokenProvider
                    .getTokenType(refreshToken)
            )
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // 회원 ID
        // =====================================================
        Long memberId =
                jwtTokenProvider
                        .getMemberId(refreshToken);


        // =====================================================
        // Redis Refresh Token 검증
        // =====================================================
        boolean valid =
                refreshTokenService
                        .validateRefreshToken(
                                memberId,
                                deviceId,
                                refreshToken
                        );


        if (!valid) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // 회원 조회
        // =====================================================
        UserDto user =
                service.findByMemberId(memberId);


        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }


        // =====================================================
        // 새로운 Access Token 발급
        // =====================================================
        String accessToken =
                jwtTokenProvider.createAccessToken(
                        user.getMemberId(),
                        user.getLoginId(),
                        deviceId
                );


        // =====================================================
        // 새로운 Refresh Token 발급
        // =====================================================
        String newRefreshToken =
                jwtTokenProvider.createRefreshToken(
                        user.getMemberId()
                );


        // =====================================================
        // Redis Refresh Token 교체
        // =====================================================
        refreshTokenService.saveRefreshToken(
                user.getMemberId(),
                deviceId,
                newRefreshToken,
                jwtTokenProvider
                        .getRefreshTokenExpiration()
        );


        // =====================================================
        // 새로운 Refresh Token Cookie
        // =====================================================
        ResponseCookie refreshTokenCookie =
                ResponseCookie.from(
                        "refreshToken",
                        newRefreshToken
                )
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(
                        jwtTokenProvider
                                .getRefreshTokenExpiration()
                                / 1000
                )
                .sameSite("Lax")
                .build();


        // =====================================================
        // Access Token만 JSON 응답
        // =====================================================
        RefreshResponseDto response =
                new RefreshResponseDto(
                        accessToken
                );


        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString()
                )
                .body(response);
    }
    
    // 로그아웃
    @Operation( summary = "로그아웃", description = "Redis에 저장된 Token 삭제" )
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            Authentication authentication
    ) {

        CustomUserDetails userDetails =
                (CustomUserDetails)
                        authentication.getPrincipal();

        Long memberId =
                userDetails.getAppUserId();


        // =====================================================
        // Redis Refresh Token 삭제
        // =====================================================
        refreshTokenService.deleteAllRefreshTokens(
                memberId
        );
        
        loginDeviceService.deleteAllLoginDevices(memberId);

        // =====================================================
        // Refresh Token Cookie 삭제
        // =====================================================
        ResponseCookie deleteRefreshCookie =
                ResponseCookie.from("refreshToken", "")
                        .httpOnly(true)
                        .secure(false)
                        .path("/")
                        .maxAge(0)
                        .sameSite("Lax")
                        .build();
        
        // JSESSIONID 쿠키 삭제
        ResponseCookie deleteSessionCookie =
                ResponseCookie.from("JSESSIONID", "")
                        .httpOnly(true)
                        .secure(false)
                        .path("/")
                        .maxAge(0)
                        .sameSite("Lax")
                        .build();


        HttpHeaders headers = new HttpHeaders();

        headers.add(
                HttpHeaders.SET_COOKIE,
                deleteRefreshCookie.toString()
        );

        headers.add(
                HttpHeaders.SET_COOKIE,
                deleteSessionCookie.toString()
        );

        return ResponseEntity
                .noContent()
                .headers(headers)
                .build();
    }
    
    // 회원정보 수정
    @Operation( summary = "회원정보 수정", description = "로그인한 회원의 회원정보와 프로필 이미지를 수정합니다." )
    @PutMapping(value = "/me", consumes = "multipart/form-data")
    public ResponseEntity<?> updateMyInfo(
    		@RequestParam(value = "nickname", required = false) String nickname,
    		@RequestParam(value = "mobile", required = false) String mobile,
    		@RequestParam(value = "gender", required = false) String gender,
    		@RequestParam(value = "birth", required = false) String birth,
    		@RequestParam(value = "interestIds", required = false) List<Integer> interestIds,
    		@RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            Authentication authentication
    ) {   	

        try {

            // 1. 로그인 회원 ID
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            Long memberId = userDetails.getAppUserId();

            // 2. DTO 생성
            UserDto dto = new UserDto();

            dto.setNickname(nickname);
            dto.setMobile(mobile);
            dto.setGender(gender);

            // birth가 들어온 경우에만 변환
            if (birth != null && !birth.isBlank()) {
                dto.setBirth(java.time.LocalDate.parse(birth));
            }

            dto.setInterestIds(interestIds);

            // 3. 프로필 이미지 처리
            if (profileImage != null && !profileImage.isEmpty()) {

                String contentType = profileImage.getContentType();

                if (contentType == null || !contentType.startsWith("image/")) {

                    return ResponseEntity
                            .badRequest().body(Map.of( "message", "이미지 파일만 업로드할 수 있습니다." ));
                }

                String originalFilename = profileImage.getOriginalFilename();

                String extension = "";

                if (originalFilename != null && originalFilename.contains(".")) {

                    extension = originalFilename.substring( originalFilename.lastIndexOf(".") );
                }

                String savedFilename = UUID.randomUUID() + extension;

                // 업로드 폴더
                Path uploadPath = Paths.get(resourcePath, "profile");

                Files.createDirectories(uploadPath);

                // 실제 파일 저장
                Path filePath = uploadPath.resolve(savedFilename);

                Files.write( filePath, profileImage.getBytes() );

                // DB 저장 URL
                String profileUrl = "/images/profile/" + savedFilename;  
                
                dto.setProfileUrl(profileUrl);
            }

            // 4. 회원정보 + 이미지 수정
            UserDto result = service.updateMember(memberId, dto);                 

            // 5. 응답
            return ResponseEntity.ok( UserResponseDto.from(result) );

        } catch (java.time.format.DateTimeParseException e) {

            return ResponseEntity
                    .badRequest().body(Map.of( "message", "생년월일 형식이 올바르지 않습니다." ));

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of( "message", "프로필 이미지 업로드에 실패했습니다." ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest().body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 회원탈퇴(논리삭제)
    @Operation( summary = "회원 탈퇴", description = "현재 로그인한 회원의 비밀번호를 확인한 후 회원을 논리삭제합니다." )
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(
            @RequestBody DeleteAccountRequestDto request,
            Authentication authentication) {

        try {

            // 1. 비밀번호 입력 확인
            if (request.getPassword() == null || request.getPassword().isBlank()) {

                return ResponseEntity.badRequest().body(Map.of( "message", "비밀번호를 입력해주세요." ));
            }

            // 2. JWT 인증 정보에서 회원 ID 가져오기
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            Long memberId = userDetails.getAppUserId();

            // 3. 회원 조회
            UserDto user = service.findByMemberId(memberId);

            if (user == null) {

                return ResponseEntity .status(HttpStatus.UNAUTHORIZED) .body(Map.of( "message", "회원정보를 찾을 수 없습니다." ));
            }

            // 4. 비밀번호 확인
            boolean passwordMatch = passwordEncoder.matches( request.getPassword(), user.getPassword() );

            if (!passwordMatch) {

                return ResponseEntity .status(HttpStatus.BAD_REQUEST) .body(Map.of( "message", "비밀번호가 일치하지 않습니다." ));
            }

            // 5. 회원 논리삭제
            service.deleteMember(memberId);

            // 6. 모든 기기의 Refresh Token 삭제
            refreshTokenService.deleteAllRefreshTokens(memberId);

            ResponseCookie deleteCookie =
                    ResponseCookie.from(
                            "refreshToken",
                            ""
                    )
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Lax")
                    .build();


            return ResponseEntity
                    .ok()
                    .header(
                            HttpHeaders.SET_COOKIE,
                            deleteCookie.toString()
                    )
                    .build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest() .body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 회원 전체 조회
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> findAllMembers() {

        List<UserDto> members = service.findAllMembers();

        List<UserResponseDto> response = members.stream()
                .map(UserResponseDto::from)
                .toList();

        return ResponseEntity.ok(response);
    }
    
    // 현재 로그인한 회원정보 조회
    @Operation(
        summary = "내 회원정보 조회",
        description = "JWT 인증된 현재 로그인 회원의 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        UserDto user = service.findByMemberId(memberId);

        if (user == null) {
            return ResponseEntity .status(HttpStatus.UNAUTHORIZED) .build();
        }
        return ResponseEntity.ok( UserResponseDto.from(user) );
    }
    
    // 로그인 기록 조회
    @Operation(
        summary = "로그인 기록 조회",
        description = "현재 로그인한 회원의 로그인 기록을 조회합니다."
    )
    @GetMapping("/login-history")
    public ResponseEntity<List<LoginHistoryResponseDto>> getMyLoginHistory(
            Authentication authentication) {

        // 1. JWT 인증 정보에서 회원 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        // 2. 로그인 기록 조회
        List<LoginHistoryResponseDto> histories = loginHistoryService.getMyLoginHistory(memberId);

        // 3. 결과 반환
        return ResponseEntity.ok(histories);
    }
    
    // 마이페이지 조회
    @Operation( summary = "마이페이지 조회", description = "JWT 인증된 현재 로그인 회원의 마이페이지 정보를 조회합니다." )
    @GetMapping("/mypage")
    public ResponseEntity<MyPageDto> getMyPage( Authentication authentication) {

        // 1. JWT 인증 정보에서 회원 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        // 2. 마이페이지 정보 조회
        MyPageDto myPage = service.getMyPage(memberId);

        // 3. 회원이 없는 경우
        if (myPage == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(myPage);
    }
    
    // 아이디 찾기
    @Operation( summary = "아이디 찾기", description = "이메일 인증이 완료된 회원의 아이디를 조회합니다." )
    @PostMapping("/find-id")
    public ResponseEntity<?> findLoginId( @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of( "message", "이메일을 입력해주세요." ));
        }

        try {
            String loginId = service.findLoginIdByEmail(email);

            return ResponseEntity.ok( Map.of( "loginId", loginId ) );
            
        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 비밀번호 찾기
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword( @RequestBody ResetPasswordDto dto) {

        try {
            String email = dto.getEmail();
            String password = dto.getPassword();

            // 1. 이메일 인증 여부 확인
            if (!verificationService.isEmailVerified(email)) {
                return ResponseEntity .status(HttpStatus.FORBIDDEN) .body(Map.of( "message", "이메일 인증이 필요합니다." ));
            }

            // 2. 비밀번호 변경
            service.resetPassword(email, password);

            // 3. 인증 완료 상태 삭제
            verificationService.removeEmailVerified(email);

            return ResponseEntity.ok( Map.of( "message", "비밀번호가 변경되었습니다." ) );

        } catch (IllegalArgumentException e) {

            return ResponseEntity .badRequest() .body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 비밀번호 변경(로그인한 유저)
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            Long memberId = userDetails.getAppUserId();

            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || currentPassword.isBlank()) {
                return ResponseEntity.badRequest() .body(Map.of( "message", "현재 비밀번호를 입력해주세요." ));
            }

            if (newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of( "message", "새 비밀번호를 입력해주세요." ));
            }

            service.changePassword( memberId, currentPassword, newPassword );

            return ResponseEntity.ok( Map.of( "message", "비밀번호가 변경되었습니다." ) );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest() .body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 로그인 기기 조회
    @Operation(
    	    summary = "로그인 기기 조회",
    	    description = "현재 로그인한 회원의 로그인 기기를 조회합니다."
    	)
	@GetMapping("/login-devices")
	public ResponseEntity<List<LoginDeviceDto>> getLoginDevices(
	        Authentication authentication) {

	    CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

	    Long memberId = userDetails.getAppUserId();
	    String currentDeviceId = userDetails.getDeviceId();

	    List<LoginDeviceDto> devices = loginDeviceService.getLoginDevices(memberId, currentDeviceId);

	    return ResponseEntity.ok(devices);
	}
    
    // 특정 기기 로그아웃
    @Operation(
    	    summary = "특정 기기 로그아웃",
    	    description = "현재 로그인한 회원의 특정 기기를 로그아웃합니다."
    	)
    @DeleteMapping("/login-devices/{deviceId}")
	public ResponseEntity<Void> deleteLoginDevice(
			@PathVariable("deviceId") String deviceId,
	        Authentication authentication) {   	
    	
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
    	
    	Long memberId = userDetails.getAppUserId();
    	
    	loginDeviceService.deleteLoginDevice(memberId, deviceId);
    	refreshTokenService.deleteRefreshToken(memberId, deviceId);
    	
    	return ResponseEntity.noContent().build();    	
    }
    
    // 모든 기기 로그아웃
    @Operation(
    	    summary = "모든 기기 로그아웃",
    	    description = "현재 로그인한 회원의 모든 로그인 기기를 로그아웃합니다."
    	)
    	@DeleteMapping("/login-devices/all")
    	public ResponseEntity<Void> deleteAllLoginDevices(
    	        Authentication authentication) {
    	
    	CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
    	
    	Long memberId = userDetails.getAppUserId();
    	
    	loginDeviceService.deleteAllLoginDevices(memberId);
    	refreshTokenService.deleteAllRefreshTokens(memberId);
    	
    	return ResponseEntity.noContent().build();   	
    }
    
    // 포인트
    @Operation(
            summary = "현재 보유 포인트 조회",
            description = "현재 로그인한 회원의 보유 포인트를 조회합니다."
    )
    @GetMapping("/me/point")
    public ResponseEntity<Integer> getMyPoint( Authentication authentication) {

        // 1. JWT 인증 정보에서 회원 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        // 2. 현재 포인트 조회
        Integer point = pointService.getCurrentPoint(memberId);

        // 3. 포인트 반환
        return ResponseEntity.ok(point);
    }
    
    // 포인트 내역 조회
    @Operation(
            summary = "포인트 내역 조회",
            description = "현재 로그인한 회원의 포인트 적립 및 사용 내역을 조회합니다."
    )
    @GetMapping("/me/point/history")
    public ResponseEntity<List<PointHistoryDto>> getMyPointHistory( Authentication authentication) {

        // 1. JWT 인증 정보에서 회원 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        // 2. 포인트 내역 조회
        List<PointHistory> histories = pointService.getPointHistory(memberId);

        // 3. Entity → DTO 변환
        List<PointHistoryDto> response = histories.stream().map(history -> {

                            PointHistoryDto dto = new PointHistoryDto();

                            dto.setHistoryId(history.getHistoryId());
                            dto.setPointPm(history.getPointPm());
                            dto.setPointType(history.getPointType());
                            dto.setPointReason(history.getPointReason());
                            dto.setCreatedAt(history.getCreatedAt());

                            return dto;
                        }).toList();
        // 4. 반환
        return ResponseEntity.ok(response);
    }
    
    // 출석체크
    @Operation(
            summary = "출석체크",
            description = "하루에 한 번 출석체크하고 포인트를 지급합니다."
    )
    @PostMapping("/me/point/attendance")
    public ResponseEntity<?> checkAttendance(
            Authentication authentication) {

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            Long memberId = userDetails.getAppUserId();
            Integer currentPoint = pointService.checkAttendance(memberId);

            return ResponseEntity.ok( Map.of( "message", "출석체크가 완료되었습니다.", "point", 10, "currentPoint", currentPoint ) );

        } catch (IllegalArgumentException e) {

            return ResponseEntity .badRequest() .body(Map.of( "message", e.getMessage() ));
        }
    }
    
    // 월별 출석 기록 조회
    @Operation(
            summary = "월별 출석 기록 조회",
            description = "현재 로그인한 회원의 특정 연도와 월의 출석 기록을 조회합니다."
    )
    @GetMapping("/me/point/attendance")
    public ResponseEntity<List<PointHistoryDto>> getAttendanceHistory(
            @RequestParam(name = "year") int year,
            @RequestParam(name = "month") int month,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long memberId = userDetails.getAppUserId();

        List<PointHistory> histories = pointService.getAttendanceHistory(memberId, year, month);

        List<PointHistoryDto> response = histories.stream()
                .map(history -> {
                    PointHistoryDto dto = new PointHistoryDto();

                    dto.setHistoryId(history.getHistoryId());
                    dto.setPointPm(history.getPointPm());
                    dto.setPointType(history.getPointType());
                    dto.setPointReason(history.getPointReason());
                    dto.setCreatedAt(history.getCreatedAt());

                    return dto;
                }).toList();

        return ResponseEntity.ok(response);
    }
    
}

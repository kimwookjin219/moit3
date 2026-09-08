package com.moit.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.PasswordChangeRequestDto;
import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserRequestDto;
import com.moit.member.dto.UserResponseDto;
import com.moit.member.dto.UserUpdateRequestDto;
import com.moit.member.enums.PasswordChangeResultEnum;
import com.moit.member.service.UserService;
import com.moit.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class UserRestController {
	private final UserService service;
	
	// 회원가입
	@Operation(summary = "회원가입" , description = "새로운 사용자를 등록합니다.")
	@PostMapping(
			value="/join",
			consumes = MediaType.MULTIPART_FORM_DATA_VALUE
			)
	public ResponseEntity<UserResponseDto> join(
			@ModelAttribute UserRequestDto request){
		UserDto dto = request.toUserDto();
		
		int result = service.insert(dto);
		
		if(result == 1) {
			return ResponseEntity
					.status(HttpStatus.CREATED)
					.body(UserResponseDto.from(dto));
		}
		
		return ResponseEntity.badRequest().build();
		
	}
	
	// 아이디 중복검사
	@Operation(summary = "아이디 중복검사", description = "사용 중인 아이디인지 중복여부를 확인합니다.")
	@GetMapping("/check-loginId")
	public ResponseEntity<Boolean> checkLoginId(
			@Parameter(description = "확인할 아이디")
			@RequestParam("loginId") String loginId
			){
		return ResponseEntity.ok(service.existsByLoginId(loginId));
	}
	
	// 닉네임 중복검사
	@Operation(summary = "닉네임 중복검사", description = "사용 중인 닉네임인지 중복여부를 확인합니다.")
	@GetMapping("/check-nickname")
	public ResponseEntity<Boolean> checkNickname(
			@Parameter(description = "확인할 닉네임")
			@RequestParam("nickname") String nickname
			){
		return ResponseEntity.ok(service.existsByNickname(nickname));
	}
	
	// 전화번호 중복검사
	@Operation(summary = "전화번호 중복검사", description = "사용 중인 전화번호인지 중복여부를 확인합니다.")
	@GetMapping("/check-mobile")
	public ResponseEntity<Boolean> checkMobile(
			@Parameter(description = "확인할 전화번호")
			@RequestParam("mobile") String mobile
			){
		return ResponseEntity.ok(service.existsByMobile(mobile));
	}
	
	// 마이페이지
	@Operation(summary = "마이페이지", description = "로그인한 사용자의 회원정보와 관심사를 조회합니다.")
	@GetMapping("/me")
	public ResponseEntity<UserResponseDto> mypage(Authentication authentication){
		String loginId = authentication.getName();
		
		UserDto searchDto  = new UserDto();
		
		searchDto .setLoginId(loginId);
		
		UserDto user = service.findByLoginId(searchDto);
		
		if(user == null) {
			return ResponseEntity.notFound().build();
		}
		
		user.setInterestIds( service.getInterestIds(user.getMemberId()) );
		
		return ResponseEntity.ok(UserResponseDto.from(user));
	}
	
	// 회원정보 수정
	@Operation(summary = "회원정보 수정", description = "로그인한 사용자의 회원정보와 관심사를 수정합니다.")
	@PutMapping("/me")
	public ResponseEntity<UserResponseDto> updateMember(
			Authentication authentication,
			@RequestBody UserUpdateRequestDto request
			){
		// 현재 로그인한 사용자
		String loginId = authentication.getName();
		
		// 회원조회
		UserDto user = new UserDto();
		
		user.setLoginId(loginId);
		
		
		UserDto loginUser = service.findByLoginId(user);
		
		if(loginUser == null){
			return ResponseEntity.notFound().build();
		}
		
		// 수정된 정보 다시 조회
		UserDto updated = service.updateMember(loginUser.getMemberId(), request);
		
		return ResponseEntity.ok(UserResponseDto.from(updated));			
	}
	
	// 비밀번호 변경
	@Operation(summary = "비밀번호 변경", description = "로그인한 사용자의 비밀번호를 변경합니다.")
	@GetMapping("/me/password")
	public ResponseEntity<Void> changePassword(
			Authentication authentication,
			@RequestBody PasswordChangeRequestDto request
			){
		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
		
		PasswordChangeResultEnum result = service.changePassword(user.getAppUserId(), request.getCurrentPassword(), request.getNewPassword());
		
		switch(result) {
			case SUCCESS: return ResponseEntity.ok().build();
			case WRONG_PASSWORD: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			case LEAKED_PASSWORD: return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
			case API_ERROR: return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
			default: return ResponseEntity.badRequest().build();
		}
	}
	
	
	
}

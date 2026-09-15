package com.moit.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserRequestDto;
import com.moit.member.dto.UserResponseDto;
import com.moit.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminController {
	
	private final MemberService memberService;

    // 관리자 회원가입
    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(
            @RequestBody UserRequestDto request) {

        UserDto dto = request.toUserDto();

        // 관리자 회원 유형으로 강제
        dto.setMemberTypeId(3L);

        UserDto result = memberService.signup(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponseDto.from(result));
    }
}

package com.moit.admin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.member.dto.UserDto;
import com.moit.member.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminController {

    private final UserService service;

    // 관리자 회원가입
    @Operation(
        summary = "관리자 회원가입",
        description = "관리자 계정으로 새로운 회원을 등록합니다."
    )
    @PostMapping("/signup")
    public ResponseEntity<?> adminSignup(@RequestBody UserDto dto) {
    	
    	System.out.println("========== 관리자 회원가입 Controller 진입 ==========");

        // 관리자 권한은 서버에서 강제로 지정
        dto.setMemberTypeId(3L);

        int result = service.insert(dto);

        if (result == 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "이미 사용 중인 아이디입니다."));
        }

        if (result == -1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "이미 사용 중인 닉네임입니다."));
        }

        if (result == -3) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "이미 사용 중인 전화번호입니다."));
        }

        return ResponseEntity.ok(
                Map.of("message", "관리자 회원가입이 완료되었습니다.")
        );
    }
}
package com.moit.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.moit.member.dto.UserDto;
import com.moit.member.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminController {
	
	private final UserService service;

    @PostMapping("/signup")
    public ResponseEntity<?> adminSignup(@RequestBody UserDto dto) {

        // 관리자 권한 고정
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

package com.moit.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.moit.member.dto.UserDto;
import com.moit.member.service.UserService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class AdminController {
	
	private final UserService service;
	
	// 관리자 회원가입
	@GetMapping("/admin/member/join")
	public String adminJoinForm(Model model) {
		return "admin/member/join";
	}
	
	@PostMapping("/admin/member/join")
	public String adminJoin(UserDto dto, RedirectAttributes rttr) {
		
		dto.setMemberTypeId(3L); // 일반 관리자 권한으로 고정

		int result = service.insert(dto);
		
		if(result == 0) {
			rttr.addFlashAttribute("errorMessage","이미 사용 중인 아이디입니다.");
			return "redirect:/admin/member/join";
		}
		
		if(result == -1) {
			rttr.addFlashAttribute("errorMessage","이미 사용 중인 닉네임입니다.");
			return "redirect:/admin/member/join";
		}
		
		rttr.addFlashAttribute("msg","관리자 가입 신청이 완료되었습니다.");
		
		return "redirect:/user/member/login";
	}
}

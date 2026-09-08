package com.moit.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MemberController {

    // 카카오 로그아웃 완료 후 진입
    @GetMapping("/user/member/kakaologout")
    public String kakaoLogout() {

        return "redirect:http://localhost:3000/user/member/login";
    }
}
package com.moit.member.service;

import java.util.List;

import com.moit.member.dto.MyPageDto;
import com.moit.member.dto.UserDto;

public interface MemberService {
	// 회원가입
	UserDto  signup(UserDto  dto);
	
	// 로그인용 회원조회
	UserDto findByLoginId(String loginId);
	
	// JWT 회원조회
    UserDto findByMemberId(Long memberId);
    
    // 마이페이지 조회
    MyPageDto getMyPage(Long memberId);
    
    // 아이디 찾기
    String findLoginIdByEmail(String email);
    
    // 비밀번호 찾기
    void resetPassword(String email, String password);
    
    // 비밀번호 변경 (로그인한 유저)
    void changePassword(Long memberId, String currentPassword, String newPassword);
    
    // 회원정보 수정
    UserDto updateMember(Long memberId, UserDto dto);
    
    void updateProfileImage(Long memberId, String profileUrl);
    
    // 회원 탈퇴
    void deleteMember(Long memberId);
    
    // 소셜 회원가입
    UserDto socialSignup(UserDto dto);
    
    // 전체 회원조회
    List<UserDto> findAllMembers();

    // 중복 확인
    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
}

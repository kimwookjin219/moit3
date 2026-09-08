package com.moit.member.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.dto.LoginHistoryResponseDto;
import com.moit.member.entity.LoginHistory;
import com.moit.member.entity.Member;
import com.moit.member.repository.LoginHistoryRepository;
import com.moit.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoginHistoryService {
	
	private final LoginHistoryRepository loginHistoryRepository;
	private final MemberRepository memberRepository;
	
	// 로그인 기록 저장
	@Transactional
	public void saveLoginHistory(
			Long memberId,
			String ipAddress,
			String userAgent,
			String loginType
			) {
		
		// 회원조회
		Member member = memberRepository.findById(memberId)
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		// 로그인 기록 생성
		LoginHistory loginHistory = new LoginHistory(member,ipAddress,userAgent,loginType);
		
		// 저장
		loginHistoryRepository.save(loginHistory);
	}
	
	// 내 로그인 기록 조회
	public List<LoginHistoryResponseDto> getMyLoginHistory(Long memberId){
		
		List<LoginHistory> histories = loginHistoryRepository.findByMemberIdOrderByLoginAtDesc(memberId);
			
		return histories.stream().map(history -> {
			LoginHistoryResponseDto dto = new LoginHistoryResponseDto();
			
			dto.setLoginHistoryId(history.getLoginHistoryId());
			dto.setLoginAt(history.getLoginAt());
			dto.setIpAddress(history.getIpAddress());
			dto.setUserAgent(history.getUserAgent());
			dto.setLoginType(history.getLoginType());
			
			return dto;
		}).toList();
	}
	
}

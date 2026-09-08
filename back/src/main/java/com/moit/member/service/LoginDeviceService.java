package com.moit.member.service;

import java.util.List;

import com.moit.member.dto.LoginDeviceDto;

public interface  LoginDeviceService {
	
	// 로그인 기기 저장
	void saveLoginDevice(
			Long memberId,
			String deviceId,
			String ipAddress,
			String userAgent,
			String loginType
			);
	
	// 로그인 기기 조회
	List<LoginDeviceDto> getLoginDevices(Long memberId, String currentDeviceId);
	
	// 특정 기기 삭제
	void deleteLoginDevice(Long memberId, String deviceId);
	
	// 모든 기기 삭제
	void deleteAllLoginDevices(Long memberId);
	
	// 로그인 기기 존재 여부
	boolean existsLoginDevice(Long memberId, String deviceId);
}

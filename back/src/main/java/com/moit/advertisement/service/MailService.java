package com.moit.advertisement.service;

import com.moit.advertisement.dto.AdvertisementDto;

public interface MailService {
	// 광고 종료 예정 메일
	void sendAdvertisementReminderMail(AdvertisementDto ad, String advertiserEmail, int remainDay);

	// 관리자 승인 → 광고주 결제 요청
    void sendAdvertisementPaymentRequestMail( AdvertisementDto ad, String advertiserEmail );
}

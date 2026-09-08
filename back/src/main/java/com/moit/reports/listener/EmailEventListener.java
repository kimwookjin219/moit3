package com.moit.reports.listener;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.moit.reports.dto.EmailRequestDto;
import com.moit.reports.service.SendEmailService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailEventListener {	// @Async(비동기) 처리

    private final SendEmailService sendEmailService;

    @Async	// 메일이 DB commit보다 먼저 출발 -> AFTER_COMMIT 사용
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEmail(EmailRequestDto emailDto) {
        sendEmailService.sendEmail(emailDto);
    }
}
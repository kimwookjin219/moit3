package com.moit.reports.service;

import org.springframework.stereotype.Service;

import com.moit.reports.api.ApiEmail;
import com.moit.reports.dto.EmailRequestDto;
import com.moit.reports.entity.Report;
import com.moit.reports.enums.ReportStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SendEmailService {		// 이메일 발송 service

	private final ApiEmail apiEmail;
	private final FailedEmailQueueService failedEmailQueueService;
	
	// 신고 결과 메일 데이터 생성 (승인/반려)
	public EmailRequestDto adminReportStatusSendEmail(
			Report report,
			ReportStatus changedStatus) {
		
		String email = report.getMember().getEmail();
		String subject = "신고 처리되지 않음.";
		String content = "신고 처리되지 않음.";
		
		if(changedStatus == ReportStatus.APPROVED) {
			subject = "[APPROVED] Moit 신고 처리 결과";
			content = report.getMember().getNickname()
    				+ " 님께서 접수하신 신고가 승인 되었습니다.";
		
		} else if(changedStatus == ReportStatus.REJECTED) {
			subject = "[REJECTED] Moit 신고 처리 결과";
			content = report.getMember().getNickname()
    				+ " 님께서 접수하신 신고가 반려 되었습니다.";
		}
		
		return new EmailRequestDto(email, subject, content);
	}
	
	// 신고 결과 메일 데이터 생성 (삭제)
	public EmailRequestDto adminReportDeleteSendEmail(Report report) {
		
		String email = report.getMember().getEmail();
		String subject = "[DELETE] Moit 신고 처리 결과";
		String content = report.getMember().getNickname()
				+ " 님께서 접수하신 신고가 삭제 되었습니다.";
		
		return new EmailRequestDto(email, subject, content);
	}

	
	
	// 완성된 메일 실제 전송
	public void sendEmail(EmailRequestDto emailDto) {

		if (emailDto.getEmail() == null || emailDto.getEmail().isBlank()) {
			System.out.println("이메일이 없습니다. 메일 전송 실패...");
            return;
        }
		
		try {
			apiEmail.sendMail(
					emailDto.getSubject(),
					emailDto.getContent(),
					emailDto.getEmail()
			);
			
		} catch (Exception e) {
			System.out.println("메일 전송 실패 → Redis Queue 저장");
	        failedEmailQueueService.push(emailDto);
	    }
		
	}
}

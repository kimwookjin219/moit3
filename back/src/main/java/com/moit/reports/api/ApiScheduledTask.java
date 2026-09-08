package com.moit.reports.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.moit.reports.dto.EmailRequestDto;
import com.moit.reports.service.FailedEmailQueueService;
import com.moit.reports.service.ReportsService;
import com.moit.reports.service.SendEmailService;

@Component
public class ApiScheduledTask {
	
	@Autowired private ReportsService service;
	
	@Autowired private SendEmailService sendEmailService;
	@Autowired private FailedEmailQueueService failedEmailQueueService;

//	test		cron = 초 분 시 일 월 요일
//	@Scheduled(fixedDelay = 10000)

	//	신고처리하고 3일뒤에 신고처리결과가 맘에 드시나요?   메일보내기 자동으로 
	@Scheduled(cron = "0 0 3 * * *")
	public void threeSendEmail() { 
		System.out.println("...신고처리 3일 후 sendEmail 스케줄러 실행");
		try {
			service.sendThreeDaysAgoReportEmails();
			
		} catch (Exception e) { e.printStackTrace(); }
		System.out.println("...신고처리 3일 후 sendEmail 스케줄러 종료");
	}
	
	// 관리자 신고 이력 3년 지나면 자동 delete
//	test
//	@Scheduled(cron = "0 */1 * * * *")
	@Scheduled(cron = "0 0 3 * * *")
	public void threeYearsAgoDeleteAuditLogs() { 
		System.out.println("...3년 전 관리자 처리 이력 삭제 스케줄러 실행");
		try {
			long deletedCount = service.deleteAuditLogs();
			System.out.println("...삭제된 관리자 처리 이력: " + deletedCount + "건");
			
		} catch (Exception e) { e.printStackTrace(); }
		System.out.println("...3년 전 관리자 처리 이력 삭제 스케줄러 종료");
	}

	
	
	// 실패 이메일 재전송
//	test
//	@Scheduled(fixedDelay = 10000)
	@Scheduled(fixedDelay = 60000)
	public void retrySendEmail() { 
		System.out.println("...실패 이메일 재전송 retrySendEmail 스케줄러 실행");
		try {
			// 실패 이메일 꺼내기
			EmailRequestDto emailDto = failedEmailQueueService.pop();
			
			// 실패 이메일 없으면 종료
			if (emailDto == null) { return; }
			
			// 실패 이메일 재전송
			sendEmailService.sendEmail(emailDto);
			
		} catch (Exception e) { e.printStackTrace(); }
		System.out.println("...실패 이메일 재전송 retrySendEmail 스케줄러 종료");
	}
}
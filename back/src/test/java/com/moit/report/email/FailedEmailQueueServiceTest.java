package com.moit.report.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.moit.reports.api.ApiScheduledTask;
import com.moit.reports.dto.EmailRequestDto;
import com.moit.reports.service.FailedEmailQueueService;
import com.moit.reports.service.ReportsService;
import com.moit.reports.service.SendEmailService;

@SpringBootTest
public class FailedEmailQueueServiceTest {

	@Autowired private FailedEmailQueueService failedEmailQueueService;
	
	@Test
	@DisplayName("실패 이메일 Redis Queue 저장 및 조회 테스트")
	void failEmailQueueTest() {

		EmailRequestDto emailDto = new EmailRequestDto(
				"test@test.com", "제목", "내용"
		);
		
		// Redis Queue 저장
		failedEmailQueueService.push(emailDto);
		
		// Redis Queue 꺼내기
		EmailRequestDto result = failedEmailQueueService.pop();
		
		assertThat(result).isNotNull();
		assertThat(result.getEmail()).isEqualTo("test@test.com");
		assertThat(result.getSubject()).isEqualTo("제목");
		assertThat(result.getContent()).isEqualTo("내용");
	}
	
	
	@Test
	@DisplayName("실패 이메일 Queue가 비어있을 때 null 반환 테스트")
	void emptyQueueTest() {
		
		// Redis Queue 꺼내기
		EmailRequestDto result = failedEmailQueueService.pop();
		
		assertThat(result).isNull();
	}
	
	
	
	
	///////////////////////////////////////////////////////////
	@ExtendWith(MockitoExtension.class)
	class ApiScheduledTaskTest {

		// 가짜 ReportsService
		@Mock
		private ReportsService service;
	
		// 가짜 이메일 발송 Service
		@Mock
		private SendEmailService sendEmailService;
	
		// 가짜 Redis Queue Service
		@Mock
		private FailedEmailQueueService failedEmailQueueService;
	
		// 위의 가짜 객체들을 ApiScheduledTask에 넣어줌
		@InjectMocks
		private ApiScheduledTask apiScheduledTask;
	
	
		@Test
		@DisplayName("실패 이메일이 있으면 재전송한다")
		void retrySendEmailTest() {
	
		    // 실패했던 이메일이라고 가정
		    EmailRequestDto emailDto =
		            new EmailRequestDto(
		                    "test@test.com",
		                    "테스트 제목",
		                    "테스트 내용"
		            );
	
		    // Queue에서 pop()하면 위 이메일이 나온다고 가정
		    when(failedEmailQueueService.pop()).thenReturn(emailDto);
	
		    // retrySendEmail 스케줄러 메서드 직접 실행
		    apiScheduledTask.retrySendEmail();
	
		    // Queue에서 이메일을 꺼냈는지 확인
		    verify(failedEmailQueueService).pop();
	
		    // 5. 꺼낸 이메일을 실제 전송 Service에 넘겼는지 확인
		    verify(sendEmailService).sendEmail(emailDto);
		}
	
	
		@Test
		@DisplayName("실패 이메일 Queue가 비어있으면 재전송하지 않는다")
		void retrySendEmailEmptyTest() {
	
		    // Queue가 비어있다고 가정
		    when(failedEmailQueueService.pop()).thenReturn(null);
	
		    // retrySendEmail 스케줄러 메서드 직접 실행
		    apiScheduledTask.retrySendEmail();
	
		    // Queue 확인은 했는지 검증
		    verify(failedEmailQueueService).pop();
	
		    // 이메일 발송은 절대 실행되지 않아야 함
		    verify(sendEmailService, never())
		            .sendEmail(org.mockito.ArgumentMatchers.any());
		}
	}
	
}
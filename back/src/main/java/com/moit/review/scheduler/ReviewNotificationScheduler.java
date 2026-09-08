package com.moit.review.scheduler;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.mail.SimpleMailMessage; 
import org.springframework.mail.javamail.JavaMailSender; 
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.moit.meetup.entity.Meetup;
import com.moit.meetup.enums.MeetupStatus; // 💡 MeetupStatus 이넘 임포트
import com.moit.review.entity.ReviewNotification;
import com.moit.review.repository.ReviewNotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@EnableScheduling
public class ReviewNotificationScheduler {

    private final ReviewNotificationRepository notificationRepository;
    
    private final JavaMailSender mailSender;

    @Scheduled(cron = "0 * * * * *") // 테스트용: 매 1분마다 실행
    @Transactional
    public void createReviewNotifications() {
        log.info("🔔 [스케줄러] 리뷰 작성 알림 생성 작업 시작...");

        LocalDateTime targetTime = LocalDateTime.now().minusMinutes(1);

        List<Meetup> finishedMeetups = notificationRepository.findFinishedMeetupsWithoutNotification(targetTime);

        for (Meetup meetup : finishedMeetups) {
            
            if (meetup.getMeetupStatus() != MeetupStatus.COMPLETED) {
                continue; 
            }

            var member = meetup.getMember();
            if (member != null) {
                // 4. DB에 웹 알림 저장
                ReviewNotification notification = ReviewNotification.builder()
                        .member(member)
                        .meetup(meetup)
                        .content("참여하신 '" + meetup.getTitle() + "' 모임은 어떠셨나요? 리뷰를 남겨주세요!")
                        .isRead("N")
                        .build();

                notificationRepository.save(notification);
                log.info("✨ [알림 생성 완료] 회원 ID: {}, 모임 ID: {}", member.getId(), meetup.getId());

                // 5. 이메일 발송
                try {
                	SimpleMailMessage mailMessage = new SimpleMailMessage();
                	mailMessage.setTo(member.getEmail()); 
                	mailMessage.setSubject("[MOIT] 모임 리뷰 작성 요청 안내");
                	mailMessage.setText("안녕하세요 " + member.getNickname() + "님!\n\n"
                	        + "참여하신 '" + meetup.getTitle() + "' 모임은 어떠셨나요?\n"
                	        + "사이트에 방문하여 소중한 리뷰를 남겨주세요!");

                	mailSender.send(mailMessage);
                	log.info("📧 [이메일 발송 완료] 수신자: {}", member.getEmail());
                } catch (Exception e) {
                    log.error("❌ [이메일 발송 실패] 수신자: {}, 에러: {}", member.getEmail(), e.getMessage());
                }
            }
        }

        log.info("🔔 [스케줄러] 리뷰 작성 알림 생성 작업 종료.");
    }
}
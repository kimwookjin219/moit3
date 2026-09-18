package com.moit.review.scheduler;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.moit.meetup.entity.Meetup;
import com.moit.meetup.enums.MeetupStatus; 
import com.moit.member.entity.Member;
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

    @Scheduled(cron = "0 * * * * *") // 매 1분마다 실행
    @Transactional
    public void createReviewNotifications() {        
        LocalDateTime targetTime = LocalDateTime.now(); 

        List<Meetup> finishedMeetups = notificationRepository.findFinishedMeetups(targetTime);       

        for (Meetup meetup : finishedMeetups) {
            log.info("📌 대상 모임 ID: {}, 모임명: {}", meetup.getId(), meetup.getTitle());
            
            if (meetup.getMeetupStatus() != MeetupStatus.COMPLETED) {
                continue; 
            }

            Set<Member> targetMembers = new HashSet<>();
          
           
            if (meetup.getMeetupApplications() != null) {
                for (var application : meetup.getMeetupApplications()) {
                    if (application.getMember() != null) {
                        targetMembers.add(application.getMember());
                    }
                }
            }
          
            for (Member member : targetMembers) {
                Long memberId = member.getId();
                Long meetupId = meetup.getId();
               
                boolean alreadyNotified = notificationRepository.existsByMemberIdAndMeetupId(memberId, meetupId);

                if (alreadyNotified) {
                    continue;
                }

                ReviewNotification notification = ReviewNotification.builder()
                        .member(member)
                        .meetup(meetup)
                        .content("참여하신 '" + meetup.getTitle() + "' 모임은 어떠셨나요? 리뷰를 남겨주세요!")
                        .isRead("N")
                        .build();

                notificationRepository.save(notification);
                log.info("✨ [알림 생성 완료] 회원 ID: {}, 모임 ID: {}", memberId, meetupId);
            }
        }

        log.info("🔔 [스케줄러] 리뷰 작성 알림 생성 작업 종료.");
    }
}
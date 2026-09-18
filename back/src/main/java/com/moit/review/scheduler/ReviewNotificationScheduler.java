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
import com.moit.meetup.enums.ApplyStatus;
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

        List<Meetup> finishedMeetups =
                notificationRepository.findFinishedMeetups(targetTime);

        for (Meetup meetup : finishedMeetups) {

            log.info("📌 대상 모임 ID: {}, 모임명: {}",
                    meetup.getId(),
                    meetup.getTitle());

            // 완료된 모임만 처리
            if (meetup.getMeetupStatus() != MeetupStatus.COMPLETED) {
                continue;
            }

            Set<Member> targetMembers = new HashSet<>();

            /*
             * 실제 신청 승인된 회원만 리뷰 알림 대상
             *
             * PENDING             → 제외
             * APPROVED            → 알림 생성
             * REJECTED            → 제외
             * CANCELED            → 제외
             * NOSHOW              → 제외
             * CANCEL_LAST_MINUTE  → 제외
             */
            if (meetup.getMeetupApplications() != null) {

                for (var application : meetup.getMeetupApplications()) {

                    if (application.getMember() != null
                            && application.getApplyStatus() == ApplyStatus.APPROVED) {

                        targetMembers.add(application.getMember());
                    }
                }
            }

            // 승인된 참가자에게만 알림 생성
            for (Member member : targetMembers) {

                Long memberId = member.getId();
                Long meetupId = meetup.getId();

                // 이미 같은 회원 + 같은 모임의 알림이 있으면 생성하지 않음
                boolean alreadyNotified =
                        notificationRepository.existsByMemberIdAndMeetupId(
                                memberId,
                                meetupId
                        );

                if (alreadyNotified) {
                    continue;
                }

                ReviewNotification notification =
                        ReviewNotification.builder()
                                .member(member)
                                .meetup(meetup)
                                .content(
                                        "참여하신 '" + meetup.getTitle()
                                        + "' 모임은 어떠셨나요? 리뷰를 남겨주세요!"
                                )
                                .isRead("N")
                                .build();

                notificationRepository.save(notification);

                log.info(
                        "✨ [리뷰 알림 생성 완료] 회원 ID: {}, 모임 ID: {}",
                        memberId,
                        meetupId
                );
            }
        }

        log.info("🔔 [스케줄러] 리뷰 작성 알림 생성 작업 종료.");
    }
}
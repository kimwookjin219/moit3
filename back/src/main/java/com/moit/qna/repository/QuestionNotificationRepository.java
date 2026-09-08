package com.moit.qna.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.qna.entity.QuestionNotification;
import com.moit.qna.enums.IsRead;

public interface QuestionNotificationRepository extends JpaRepository<QuestionNotification, Long> {

    // 읽지 않은 알림 개수
    long countByMember_IdAndIsRead(Long memberId, IsRead isRead);

    // 읽지 않은 알림 조회
    List<QuestionNotification> findByMember_IdAndIsRead(Long memberId, IsRead isRead );

    // 전체 알림 조회
    List<QuestionNotification> findByMember_Id(Long memberId );

    // 알림 읽음 처리
    @Modifying
    @Query("""
            UPDATE QuestionNotification qn
            SET qn.isRead = 'Y'
            WHERE qn.notificationId = :notificationId
            """)
    void readNotification( @Param("notificationId") Long notificationId );
    
    // 오래된 알림부터 조회
    List<QuestionNotification> findByMember_IdOrderByCreatedAtAsc(
            Long memberId
    );

}
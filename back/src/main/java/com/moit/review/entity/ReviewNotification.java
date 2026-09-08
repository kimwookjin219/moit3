package com.moit.review.entity;

import com.moit.meetup.entity.Meetup;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "REVIEW_NOTIFICATIONS")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewNotification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", unique = true, nullable = false)
    private Long id;

    // 회원 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 모임 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meetup_id", nullable = false)
    private Meetup meetup;

    // 알림 내용
    @Column(nullable = false, length = 255)
    private String content;

    // 읽음 여부 (Y / N)
    @Column(name = "is_read", length = 1, nullable = false)
    private String isRead = "Y".equals("N") ? "Y" : "N"; // 기본값 'N'

    @PrePersist
    public void prePersist() {
        if (this.isRead == null) {
            this.isRead = "N";
        }
    }
}
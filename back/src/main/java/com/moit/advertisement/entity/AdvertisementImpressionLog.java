package com.moit.advertisement.entity;

import java.time.LocalDateTime;

import com.moit.advertisement.enums.AdPosition;
// import com.moit.member.entity.Member;
import com.moit.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Table(name = "ADVERTISEMENT_IMPRESSION_LOG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdvertisementImpressionLog {

    // 광고 노출 로그 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_impression_log_seq"
    )
    @SequenceGenerator(
        name = "advertisement_impression_log_seq",
        sequenceName = "ADVERTISEMENT_IMPRESSION_LOG_SEQ",
        allocationSize = 1
    )
    @Column(name = "IMPRESSION_ID")
    private Long impressionId;


    // 노출된 광고
    @ManyToOne
    @JoinColumn(name = "AD_ID", nullable = false)
    private Advertisement advertisement;


    // 광고를 노출받은 회원
    // 비회원도 광고를 볼 수 있으므로 NULL 허용
    @ManyToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;
    


    // 광고가 노출된 디바이스
    // PC / MOBILE / TABLET 등
    // 광고 타겟 조건이 아니라 실제 접속 환경 기록용
    @Column(name = "DEVICE_TYPE", length = 20)
    private String deviceType;


    // 접속 IP 주소
    // 동일 사용자의 중복 노출 분석에 활용
    @Column(name = "IP_ADDRESS", length = 100)
    private String ipAddress;


    // 광고 노출 시간
    @Column(name = "VIEWED_AT", nullable = false)
    private LocalDateTime viewedAt;


    // 세션 ID
    // 비회원의 중복 노출 분석 정확도를 높이기 위해 사용
    @Column(name = "SESSION_ID", length = 128)
    private String sessionId;


    // 광고가 노출된 위치
    // MAIN / MEETUP_LIST_BANNER /
    // MEETUP_LIST_SIDEBAR / MEETUP_DETAIL_SIDEBAR
    @Enumerated(EnumType.STRING)
    @Column(name = "POSITION", length = 30, nullable = false)
    private AdPosition position;


    // Entity 최초 저장 시 노출 시간 자동 설정
    @PrePersist
    void onCreate() {
        if (this.viewedAt == null) {
            this.viewedAt = LocalDateTime.now();
        }
    }
}
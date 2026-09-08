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
@Table(name = "ADVERTISEMENT_CLICK_LOG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdvertisementClickLog {

    // 광고 클릭 로그 PK
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "advertisement_click_log_seq"
    )
    @SequenceGenerator(
        name = "advertisement_click_log_seq",
        sequenceName = "ADVERTISEMENT_CLICK_LOG_SEQ",
        allocationSize = 1
    )
    @Column(name = "CLICK_ID")
    private Long clickId;


    // 클릭된 광고
    @ManyToOne
    @JoinColumn(name = "AD_ID", nullable = false)
    private Advertisement advertisement;


    // 광고를 클릭한 회원
    // 비회원도 광고를 클릭할 수 있으므로 NULL 허용
    @ManyToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;
    


    // 광고를 클릭한 디바이스
    // PC / MOBILE / TABLET 등
    // 광고 타겟 조건이 아니라 실제 클릭 환경 기록용
    @Column(name = "DEVICE_TYPE", length = 20)
    private String deviceType;


    // 클릭 당시 접속 IP 주소
    // 중복 클릭 분석에 활용
    @Column(name = "IP_ADDRESS", length = 100)
    private String ipAddress;


    // 광고 클릭 전 유입 경로
    // 예) 모집글 페이지, 메인 페이지 등
    @Column(name = "REFERRER", length = 255)
    private String referrer;


    // 광고 클릭 시간
    @Column(name = "CLICKED_AT", nullable = false)
    private LocalDateTime clickedAt;


    // 세션 ID
    // 비회원의 중복 클릭 분석에 활용
    @Column(name = "SESSION_ID", length = 128)
    private String sessionId;


    // 광고가 클릭된 위치
    // MAIN / MEETUP_LIST_BANNER /
    // MEETUP_LIST_SIDEBAR / MEETUP_DETAIL_SIDEBAR
    @Enumerated(EnumType.STRING)
    @Column(name = "POSITION", length = 30, nullable = false)
    private AdPosition position;


    // Entity 최초 저장 시 클릭 시간 자동 설정
    @PrePersist
    void onCreate() {
        if (this.clickedAt == null) {
            this.clickedAt = LocalDateTime.now();
        }
    }
}
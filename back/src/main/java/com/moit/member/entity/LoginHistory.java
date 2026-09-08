package com.moit.member.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LOGIN_HISTORY")
@Getter
@NoArgsConstructor
public class LoginHistory {
	
	@Id
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "login_history_seq" )
    @SequenceGenerator( name = "login_history_seq", sequenceName = "LOGIN_HISTORY_SEQ", allocationSize = 1 )
    @Column(name = "LOGIN_HISTORY_ID")
    private Long loginHistoryId;


    // 로그인한 회원
    @ManyToOne(fetch = FetchType.LAZY, optional = false) 
    @JoinColumn( name = "MEMBER_ID", nullable = false )
    private Member member;


    // 로그인 시간
    @Column( name = "LOGIN_AT", nullable = false )
    private LocalDateTime loginAt;


    // 로그인 IP
    @Column(name = "IP_ADDRESS", length = 100)
    private String ipAddress;


    // 브라우저 / OS 정보
    @Column(name = "USER_AGENT", length = 500)
    private String userAgent;


    // 로그인 유형
    @Column( name = "LOGIN_TYPE", length = 20, nullable = false )
    private String loginType;


    // 생성 메서드
    public LoginHistory( Member member, String ipAddress, String userAgent, String loginType ) {
        this.member = member;
        this.loginAt = LocalDateTime.now();
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.loginType = loginType;
    }

}

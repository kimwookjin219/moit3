package com.moit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.entity.Member;
import com.moit.member.entity.MemberInfo;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.member.enums.MemberStatusEnum;
import com.moit.member.enums.MemberTypeEnum;
import com.moit.member.repository.MemberInfoRepository;
import com.moit.member.repository.MemberRepository;
import com.moit.member.repository.MemberStatusRepository;
import com.moit.member.repository.MemberTypeRepository;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.repository.MemberReportStatusRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component // 설정 파일과 별개로 스프링 구동 시 자동 실행됩니다.
@Order(2)
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final MemberInfoRepository memberInfoRepository;
    private final MemberTypeRepository memberTypeRepository;
    private final MemberStatusRepository memberStatusRepository;
    private final MemberReportStatusRepository memberReportStatusRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${admin.info.id}")
    private String adminId;
    
    @Value("${admin.info.password}")
    private String adminPassword;
    
    @Value("${admin.info.nickname}")
    private String adminNickname;
    
    @Value("${admin.info.email}")
    private String adminEmail;
    
    @Value("${admin.info.mobile}")
    private String adminMobile;
    
    @Value("${demo.member.id}")
    private String demoMemberId;

    @Value("${demo.member.password}")
    private String demoMemberPassword;

    @Value("${demo.member.nickname}")
    private String demoMemberNickname;

    @Value("${demo.member.email}")
    private String demoMemberEmail;

    @Value("${demo.member.mobile}")
    private String demoMemberMobile;

    @Value("${demo.partner.id}")
    private String demoPartnerId;

    @Value("${demo.partner.password}")
    private String demoPartnerPassword;

    @Value("${demo.partner.nickname}")
    private String demoPartnerNickname;

    @Value("${demo.partner.email}")
    private String demoPartnerEmail;

    @Value("${demo.partner.mobile}")
    private String demoPartnerMobile;
    
    @Value("${demo.member2.id}")
    private String demoMember2Id;

    @Value("${demo.member2.password}")
    private String demoMember2Password;

    @Value("${demo.member2.nickname}")
    private String demoMember2Nickname;

    @Value("${demo.member2.email}")
    private String demoMember2Email;

    @Value("${demo.member2.mobile}")
    private String demoMember2Mobile;
    
    @Override
    @Transactional // ✅ 이 파일 전체가 하나의 트랜잭션으로 묶여서 안전합니다.
    public void run(String... args) throws Exception {
       // 회원 상태 조회 
       MemberStatus activeStatus = memberStatusRepository 
             .findById(MemberStatusEnum.ACTIVE.getId()) 
             .orElseThrow(() -> new RuntimeException("ACTIVE 회원 상태를 찾을 수 없습니다.") );
       // 신고 상태 조회 
       MemberReportStatus normalReportStatus = memberReportStatusRepository 
             .findById(1L) 
             .orElseThrow(() -> new RuntimeException("기본 회원 신고 상태를 찾을 수 없습니다.") );
       
       // ========================================================= 
       // 1. 최고관리자 Demo 
       // ========================================================= 
       createDemoMember( 
             adminId, 
             adminPassword, 
             adminNickname, 
             adminEmail, 
             adminMobile,
             MemberTypeEnum.ROLE_SUPERADMIN, 
             activeStatus, 
             normalReportStatus 
             );
    
       // ========================================================= 
       // 2. 일반회원 Demo 
       // ========================================================= 
       createDemoMember( 
             demoMemberId,
              demoMemberPassword,
              demoMemberNickname,
              demoMemberEmail,
              demoMemberMobile,
              MemberTypeEnum.ROLE_MEMBER,
              activeStatus,
              normalReportStatus
             );
       
       createDemoMember(
               demoMember2Id,
               demoMember2Password,
               demoMember2Nickname,
               demoMember2Email,
               demoMember2Mobile,
               MemberTypeEnum.ROLE_MEMBER,
               activeStatus,
               normalReportStatus
       );
       
       // ========================================================= 
       // 3. 제휴업체 Demo 
       // ========================================================= 
       createDemoMember( 
             demoPartnerId,
              demoPartnerPassword,
              demoPartnerNickname,
              demoPartnerEmail,
              demoPartnerMobile,
              MemberTypeEnum.ROLE_PARTNER,
              activeStatus,
              normalReportStatus 
             );
    }
    
    /** 
     * 데모 회원 생성 * 
     * 이미 동일한 LoginId가 존재하면 생성하지 않습니다. 
     */ 
    private void createDemoMember(
          String loginId, 
          String password, 
          String nickname, 
          String email, 
          String mobile, 
          MemberTypeEnum memberTypeEnum, 
          MemberStatus memberStatus, 
          MemberReportStatus memberReportStatus 
          ) {
       // 이미 존재하면 생성하지 않음 
       if (memberRepository.existsByLoginId(loginId)) {
          log.info("[DemoInit] 이미 존재하는 계정입니다. loginId={}", loginId); 
          return; 
          }
       // MemberType 조회 
       MemberType memberType = memberTypeRepository 
             .findById(memberTypeEnum.getId()) 
             .orElseThrow(() -> new RuntimeException( memberTypeEnum.name() + " 회원 타입을 찾을 수 없습니다." ) );
    
       // ========================================================= 
       // Member 생성 
       // ========================================================= 
       Member member = new Member(); 
       member.setLoginId(loginId); 
       member.setPassword(passwordEncoder.encode(password)); 
       member.setNickname(nickname); 
       member.setEmail(email); 
       member.setMobile(mobile); 
       member.setMemberType(memberType); 
       member.setMemberStatus(memberStatus); 
       memberRepository.save(member);
       
       // ========================================================= 
       // MemberInfo 생성 
       // ========================================================= 
       MemberInfo memberInfo = new MemberInfo(); 
       memberInfo.setMember(member);
       
       // 기존 관리자와 동일하게 기본 성별 설정 
       memberInfo.setGender("M"); 
       memberInfo.setMemberReportStatus(memberReportStatus); 
       memberInfoRepository.save(memberInfo); 
       log.info( 
             "[DemoInit] 데모 계정 생성 완료. loginId={}, type={}", 
             loginId, 
             memberTypeEnum.name() 
             );
    }
}
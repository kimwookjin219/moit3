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
    
    @Override
    @Transactional // ✅ 이 파일 전체가 하나의 트랜잭션으로 묶여서 안전합니다.
    public void run(String... args) throws Exception {
        
        if (memberRepository.existsByLoginId("admin")) {
            return; // 이미 있으면 패스
        }

        //log.info("🔥 [AdminInit] 최고관리자 계정(admin) 초기 데이터를 생성합니다.");

        MemberType superAdminType = memberTypeRepository
        	    .findByTypeName("ROLE_SUPERADMIN")
        	    .orElseGet(() -> {
        	        MemberType newType = new MemberType();
        	        newType.setTypeName("ROLE_SUPERADMIN");

        	        return memberTypeRepository.save(newType);
        	    });               
        MemberStatus activeStatus = memberStatusRepository.findById(MemberStatusEnum.ACTIVE.getId()) // 상태 Enum명 확인 필요
                .orElseThrow(() -> new RuntimeException("ACTIVE 회원 상태를 찾을 수 없습니다."));

        // Member 세팅
        Member admin = new Member();
        admin.setLoginId(adminId);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setNickname(adminNickname);
        admin.setEmail(adminEmail);
        admin.setMobile(adminMobile);
        // 삭제 여부 타입이 Character인 것으로 보여 'N'으로 수정했습니다. 
        // admin.setDeleteYn('N'); 
        
        admin.setMemberType(superAdminType);
        admin.setMemberStatus(activeStatus);
        
        memberRepository.save(admin);

        // MemberInfo 세팅
        MemberInfo adminInfo = new MemberInfo();
        adminInfo.setMember(admin);
        adminInfo.setGender("M");
        
        MemberReportStatus normalReportStatus = memberReportStatusRepository.findById(1L)
                .orElseGet(() -> {
                    MemberReportStatus newStatus = new MemberReportStatus();
                    // ID 설정 등 구조에 맞게 조절
                    return memberReportStatusRepository.save(newStatus);
                });
        adminInfo.setMemberReportStatus(normalReportStatus);
        
        memberInfoRepository.save(adminInfo);

        //log.info("🔥 [AdminInit] 최고관리자 계정 생성 완료 (ID: admin / PW: admin123)");
    }
}
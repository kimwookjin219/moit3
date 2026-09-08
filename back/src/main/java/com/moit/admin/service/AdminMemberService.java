package com.moit.admin.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.admin.dto.AdminMemberDto;
import com.moit.admin.dto.AdminMemberStatsDto;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberStatus;
import com.moit.member.repository.MemberRepository;
import com.moit.member.repository.MemberStatusRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final MemberStatusRepository memberStatusRepository;

    // 관리자 회원 목록 조회
    public Page<AdminMemberDto> findMembers(
        Long memberTypeId,
        Character deleteYn,
        String keyword,
        Pageable pageable
    ) {

        Page<Member> members = memberRepository.findAdminMembers( memberTypeId, deleteYn, keyword, pageable );

        return members.map(this::toDto);
    }


    // Entity → DTO
    private AdminMemberDto toDto(Member member) {

        AdminMemberDto dto = new AdminMemberDto();

        dto.setMemberId(member.getId());
        dto.setLoginId(member.getLoginId());
        dto.setNickname(member.getNickname());
        dto.setEmail(member.getEmail());
        dto.setMobile(member.getMobile());
        dto.setProfileUrl(member.getProfileUrl());
        dto.setProvider(member.getProvider());

        if (member.getMemberType() != null) {
            dto.setMemberTypeId( member.getMemberType().getMemberTypeId());
        }

        if (member.getMemberStatus() != null) {
            dto.setStatusId( member.getMemberStatus().getStatusId() );
        }

        dto.setCreatedAt(member.getCreatedAt());

        return dto;
    }
    
    // 관리자 회원 통계
    public AdminMemberStatsDto getMemberStats() {
    	
    	final Character DELETE_YES = 'Y';
    	final Character DELETE_NO = 'N';
    	
    	AdminMemberStatsDto dto = new AdminMemberStatsDto();
    	
    	// 전체회원
    	Long allCount = memberRepository.countByDeleteYn(DELETE_NO);
    	
    	// 관리자
    	Long adminCount = memberRepository.countByMemberType_MemberTypeIdAndDeleteYn(3L, DELETE_NO);
    	
    	// 최고 관리자
    	Long superAdminCount = memberRepository.countByMemberType_MemberTypeIdAndDeleteYn(4L, DELETE_NO);
    	
    	// 일반 회원
    	Long memberCount = memberRepository.countByMemberType_MemberTypeIdAndDeleteYn(1L, DELETE_NO);
    	
    	// 정지 회원
    	Long suspendedCount = memberRepository.countByMemberStatus_StatusIdAndDeleteYn(3L, DELETE_NO);
    	
    	// 오늘 가입자 수
    	Long todayCount = memberRepository.countTodayMembers();
    	
    	dto.setAllCount(allCount);
    	dto.setAdminCount(adminCount + superAdminCount);
    	dto.setMemberCount(memberCount);
    	dto.setSuspendedCount(suspendedCount);
    	dto.setTodayCount(todayCount);
    	
    	return dto;
    }
    
    @Transactional
    public void updateMemberStatus(Long memberId, Long statusId) {
    	Member member = memberRepository.findById(memberId)
    						.orElseThrow(()-> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    	
    	MemberStatus status = memberStatusRepository.findById(statusId)
    							.orElseThrow(()-> new IllegalArgumentException("회원 상태를 찾을 수 없습니다."));
    	
    	member.setMemberStatus(status);
    }
    
    @Transactional
    public void restoreMember(Long memberId) {
    	Member member = memberRepository.findById(memberId)
    						.orElseThrow(()-> new IllegalArgumentException("회원을 찾을 수 없습니다,"));
    	
    	// 탈퇴 회원인지 확인
    	if(member.getDeleteYn() != 'Y') {
    		throw new IllegalArgumentException("탈퇴회원이 아닙니다.");
    	}
    	
    	// 탈퇴회원 복수
    	member.setDeleteYn('N');
    	
    	// 상태도 정상으로 복구
    	MemberStatus status = memberStatusRepository.findById(1L)
    							.orElseThrow(()-> new IllegalArgumentException("정상 회원 상태를 찾을 수 없습니다."));
    
    	member.setMemberStatus(status);
    }
    
}
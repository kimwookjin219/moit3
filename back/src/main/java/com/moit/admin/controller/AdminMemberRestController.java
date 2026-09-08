package com.moit.admin.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.admin.dto.AdminMemberDto;
import com.moit.admin.dto.AdminMemberStatsDto;
import com.moit.admin.service.AdminMemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class AdminMemberRestController {

    private final AdminMemberService adminMemberService;

    // 관리자 회원 목록   
    @GetMapping
    public ResponseEntity<Page<AdminMemberDto>> getMembers(
        @RequestParam(name = "memberTypeId",required = false) Long memberTypeId,
        @RequestParam(name = "deleteYn", required = false) Character deleteYn,
        @RequestParam(name = "keyword",required = false) String keyword,
        @RequestParam(name = "page",defaultValue = "0") int page,
        @RequestParam(name = "size",defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of( page, size, Sort.by( Sort.Direction.DESC, "id" ) );

        Page<AdminMemberDto> result = adminMemberService.findMembers( memberTypeId, deleteYn, keyword, pageable );

        return ResponseEntity.ok(result);
    }
    
    // 관리자 회원 통계
    @GetMapping("/stats")
    public ResponseEntity<AdminMemberStatsDto> getMemberStats() {

        AdminMemberStatsDto result = adminMemberService.getMemberStats();

        return ResponseEntity.ok(result);
    }
    
    // 회원 상태변경
    @PutMapping("/{memberId}/status")
    public ResponseEntity<?> updateMemberStatus(
    		@PathVariable("memberId") Long memberId,
    		@RequestParam("statusId") Long statusId
    		){
    	adminMemberService.updateMemberStatus(memberId,statusId);
    	
    	return ResponseEntity.ok().build();
    }
    
    // 탈퇴회원 복구
    @PutMapping("/{memberId}/restore")
    public ResponseEntity<?> restoreMember(@PathVariable("memberId") Long memberId){
    	adminMemberService.restoreMember(memberId);
    	
    	return ResponseEntity.ok().build();
    }
    
}

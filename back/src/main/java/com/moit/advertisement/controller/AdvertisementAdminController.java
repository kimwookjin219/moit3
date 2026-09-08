package com.moit.advertisement.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moit.advertisement.dto.AdminAdvertisementStatDto;
import com.moit.advertisement.dto.AdvertisementChartDto;
import com.moit.advertisement.dto.AdvertisementDto;
import com.moit.advertisement.dto.AdvertisementPaymentDto;
import com.moit.advertisement.dto.AdvertisementSearchDto;
import com.moit.advertisement.enums.ApprovalStatus;
import com.moit.advertisement.service.AdvertisementService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.moit.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/advertisement")
@Tag(
    name = "Admin Advertisement",
    description = "관리자 광고 관리 API"
)
public class AdvertisementAdminController {

    private final AdvertisementService advertisementService;
    
    private Long getLoginMemberId(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다."
            );
        }

        CustomUserDetails user =
                (CustomUserDetails) authentication.getPrincipal();

        return user.getUser().getMemberId();
    }
    
    // =========================================================
    // 승인 관리 탭 API (승인 대기 + 승인 완료되었으나 결제 대기인 광고 포함)
    // =========================================================
    @Operation(
	    summary = "광고 승인 대기 목록 조회",
	    description = "승인 대기 중이거나 승인 완료 후 결제 대기 중인 광고 목록을 조회합니다."
	)
    @GetMapping("/approval-tab")
    public ResponseEntity<AdvertisementDto.AdvertisementPageResponseDto> approvalTabList(
    		AdvertisementSearchDto dto) 
    {
        dto.setPage(dto.getPage() <= 0 ? 1 : dto.getPage());
        dto.setSize(dto.getSize() <= 0 ? 10 : dto.getSize());

        List<AdvertisementDto> list = advertisementService.searchApprovalTabList(dto);
        long totalCnt = advertisementService.selectApprovalTabTotalCnt(dto);

        return ResponseEntity.ok(
                new AdvertisementDto.AdvertisementPageResponseDto(
                		list, (int) totalCnt, dto.getPage(), dto.getSize())
        );
    }

    @Operation(summary = "승인 관리 탭 개수 조회")
    @GetMapping("/approval-tab/count")
    public ResponseEntity<Long> approvalTabCount(AdvertisementSearchDto dto) {
        return ResponseEntity.ok((long)advertisementService.selectApprovalTabTotalCnt(dto));
    }
    

	 // =========================================================
	 // 결제 확인 탭 API
	 // =========================================================
	 @Operation(
	     summary = "결제 확인 탭 목록 조회",
	     description = "광고의 결제 이력을 조회합니다."
	 )
	 @GetMapping("/payment-tab")
	 public ResponseEntity<AdvertisementDto.AdvertisementPaymentPageResponseDto> paymentTabList(
	         AdvertisementSearchDto dto) {
	
	     dto.setPage(dto.getPage() <= 0 ? 1 : dto.getPage());
	     dto.setSize(dto.getSize() <= 0 ? 10 : dto.getSize());
	
	     List<AdvertisementPaymentDto> list = advertisementService.searchPaymentHistory(dto);
	     long totalCnt = advertisementService.selectPaymentTabTotalCnt(dto);
	
	     return ResponseEntity.ok(
	             new AdvertisementDto.AdvertisementPaymentPageResponseDto(
	                     list,
	                     (int) totalCnt,
	                     dto.getPage(),
	                     dto.getSize()
	             )
	     );
	 }

    @Operation(summary = "결제 확인 탭 개수 조회")
    @GetMapping("/payment-tab/count")
    public ResponseEntity<Long> paymentTabCount(AdvertisementSearchDto dto) {
        return ResponseEntity.ok((long)advertisementService.selectPaymentTabTotalCnt(dto));
    }

    // =========================================================
    // 광고 운영 관리 목록
    // =========================================================
    @Operation(
        summary = "운영 관리 탭 목록 조회",
        description = "승인 및 결제가 모두 완료되어 운영 중인 광고 목록을 조회합니다."
    )
    @GetMapping("/status-tab")
    public ResponseEntity<AdvertisementDto.AdvertisementPageResponseDto> statusTabList(
    		AdvertisementSearchDto dto) 
    {
        dto.setPage(dto.getPage() <= 0 ? 1 : dto.getPage());
        dto.setSize(dto.getSize() <= 0 ? 10 : dto.getSize());

        List<AdvertisementDto> list = advertisementService.searchStatusTabList(dto);
        long totalCnt = advertisementService.selectStatusTabTotalCnt(dto);

        return ResponseEntity.ok(
                new AdvertisementDto.AdvertisementPageResponseDto(
                		list, (int) totalCnt, dto.getPage(), dto.getSize())
        );
    }

    @Operation(summary = "운영 관리 탭 개수 조회")
    @GetMapping("/status-tab/count")
    public ResponseEntity<Long> statusTabCount(AdvertisementSearchDto dto) {
        return ResponseEntity.ok((long)advertisementService.selectStatusTabTotalCnt(dto));
    }


    // =========================================================
    // 광고 관리 목록 총 개수
    // GET /api/admin/advertisement/count
    // =========================================================
    @Operation(
	    summary = "광고 관리 목록 개수 조회",
	    description = "승인 대기 또는 승인 완료 광고의 전체 개수를 조회합니다."
	)
    @GetMapping("/count")
    public ResponseEntity<Long> manageCount(
            @RequestParam(name = "tab", required = false, defaultValue = "approval")
            String tab,

            AdvertisementSearchDto dto) {

        long totalCnt;

        if ("approval".equals(tab)) {

            dto.setApprovalStatus(ApprovalStatus.WAITING);

            totalCnt = advertisementService.selectWaitingTotalCnt(dto);

        } else {

            dto.setApprovalStatus(ApprovalStatus.APPROVED);

            totalCnt = advertisementService.selectAdminAdvertisementTotalCnt(dto);
        }

        return ResponseEntity.ok(totalCnt);
    }

    @GetMapping("/stats/approval")
    public ResponseEntity<AdminAdvertisementStatDto.ApprovalStat> getApprovalStats() {
        return ResponseEntity.ok(advertisementService.getApprovalStats());
    }

    @GetMapping("/stats/payment")
    public ResponseEntity<AdminAdvertisementStatDto.PaymentStat> getPaymentStats() {
        return ResponseEntity.ok(advertisementService.getPaymentStats());
    }

    @GetMapping("/stats/status")
    public ResponseEntity<AdminAdvertisementStatDto.StatusStat> getStatusStats() {
        return ResponseEntity.ok(advertisementService.getStatusStats());
    }
    
    // =========================================================
    // 광고 상세
    // =========================================================
    @Operation(
	    summary = "광고 상세 조회",
	    description = "광고 ID를 이용하여 광고 상세 정보를 조회합니다."
	)
    @GetMapping("/{adId}")
    public ResponseEntity<AdvertisementDto> detail(
            @PathVariable("adId") Long adId) {

        AdvertisementDto dto = advertisementService.selectAdvertisementOne(adId);

        if (dto == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(dto);
    }

    // =========================================================
    // 광고 승인
    // =========================================================
    @Operation(
	    summary = "광고 승인",
	    description = "관리자가 광고를 승인합니다."
	)
	@PatchMapping("/{adId}/approve")
	public ResponseEntity<Void> approve(
	        @PathVariable("adId") Long adId,
	        Authentication authentication) {
    	
    	Long loginAdminId = getLoginMemberId(authentication);

	    AdvertisementDto.AdvertisementAdminUpdateDto dto =
	            new AdvertisementDto.AdvertisementAdminUpdateDto();

	    dto.setAdId(adId);
	    dto.setApprovalStatus("APPROVED");
	    dto.setStatus("PENDING");
	    dto.setApprovedBy(loginAdminId);
	    dto.setApprovedAt(LocalDateTime.now());

	    advertisementService.updateApprovalStatus(dto);

	    return ResponseEntity.ok().build();
	}

    // =========================================================
    // 광고 반려
    // PATCH /api/admin/advertisement/{adId}/reject
    // =========================================================
    @Operation(
	    summary = "광고 반려",
	    description = "관리자가 광고를 반려하고 반려 사유를 저장합니다."
	)
    @PatchMapping("/{adId}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable("adId") Long adId,
            @RequestParam(name = "rejectReason") String rejectReason,
            Authentication authentication) {
    	
    	Long loginAdminId = getLoginMemberId(authentication);

        AdvertisementDto.AdvertisementAdminUpdateDto dto =
                new AdvertisementDto.AdvertisementAdminUpdateDto();

        dto.setAdId(adId);
        dto.setApprovalStatus("REJECTED");

        dto.setApprovedBy(loginAdminId);
        dto.setRejectReason(rejectReason);
        dto.setApprovedAt(LocalDateTime.now());

        advertisementService.updateApprovalStatus(dto);

        return ResponseEntity.ok().build();
    }

    // =========================================================
    // 광고 상태 변경
    // PATCH /api/admin/advertisement/{adId}/status
    // =========================================================
    @Operation(
	    summary = "광고 상태 변경",
	    description = "관리자가 광고의 상태를 변경합니다."
	)
    @PatchMapping("/{adId}/status")
    public ResponseEntity<Void> status(
            @PathVariable("adId") Long adId,
            @RequestParam(name = "status") String status,
            Authentication authentication) {
    	
    	Long loginAdminId = getLoginMemberId(authentication);

        AdvertisementDto.AdvertisementAdminUpdateDto dto =
                new AdvertisementDto.AdvertisementAdminUpdateDto();

        dto.setAdId(adId);
        dto.setStatus(status);

        dto.setStatusUpdatedBy(loginAdminId);
        dto.setStatusUpdatedAt(LocalDateTime.now());

        advertisementService.updateAdvertisementStatus(dto);

        return ResponseEntity.ok().build();
    }
    
    // =========================================================
    // 광고 기간 변경
    // PATCH /api/admin/advertisement/{adId}/period
    // =========================================================
    @Operation(
	    summary = "광고 기간 변경",
	    description = "광고의 시작일과 종료일을 변경합니다."
	)
    @PatchMapping("/{adId}/period")
    public ResponseEntity<Void> updatePeriod(
            @PathVariable("adId") Long adId,

            @RequestParam(name = "start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate start,

            @RequestParam(name = "end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate end) {

        advertisementService.updatePeriod(
                adId,
                start.atStartOfDay(),
                end.atStartOfDay()
        );

        return ResponseEntity.ok().build();
    }
}
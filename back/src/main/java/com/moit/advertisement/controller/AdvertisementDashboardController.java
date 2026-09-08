package com.moit.advertisement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.advertisement.dto.AdvertisementChartDto;
import com.moit.advertisement.dto.DashboardAiDto;
import com.moit.advertisement.service.AdvertisementService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/advertisement/dashboard")
@Tag(
    name = "Admin Advertisement Dashboard",
    description = "관리자 광고 대시보드 API"
)
public class AdvertisementDashboardController {

    private final AdvertisementService advertisementService;


    // =========================================================
    // 대시보드 전체 통계
    // =========================================================

    @Operation(
        summary = "광고 대시보드 요약 통계",
        description = "최근 7일 기준 광고 노출, 클릭, CTR 등의 요약 통계를 조회합니다."
    )
    @GetMapping("/summary")
    public ResponseEntity<AdvertisementChartDto> summary() {

        return ResponseEntity.ok(
            advertisementService.selectSummary()
        );
    }


    // =========================================================
    // 최근 7일 일일 통계
    // =========================================================

    @Operation(
        summary = "최근 7일 광고 통계",
        description = "최근 7일 동안의 광고 노출수와 클릭수를 조회합니다."
    )
    @GetMapping("/daily")
    public ResponseEntity<List<AdvertisementChartDto>> dailyChart() {

        return ResponseEntity.ok(
            advertisementService.selectDailyChart()
        );
    }


    // =========================================================
    // CTR TOP 5
    // =========================================================

    @Operation(
        summary = "광고 CTR TOP 5",
        description = "최근 7일 기준 CTR이 높은 광고 TOP 5를 조회합니다."
    )
    @GetMapping("/ctr")
    public ResponseEntity<List<AdvertisementChartDto>> ctrChart() {

        return ResponseEntity.ok(
            advertisementService.selectTopCtrChart()
        );
    }


    // =========================================================
    // 광고 등급 비율
    // =========================================================

    @Operation(
        summary = "광고 등급 비율",
        description = "삭제되지 않은 광고의 등급별 비율을 조회합니다."
    )
    @GetMapping("/grade")
    public ResponseEntity<List<AdvertisementChartDto>> gradeChart() {

        return ResponseEntity.ok(
            advertisementService.selectGradeChart()
        );
    }


    // =========================================================
    // 광고 위치별 노출
    // =========================================================

    @Operation(
        summary = "광고 위치별 노출",
        description = "최근 7일 기준 광고 위치별 노출수를 조회합니다."
    )
    @GetMapping("/position")
    public ResponseEntity<List<AdvertisementChartDto>> positionChart() {

        return ResponseEntity.ok(
            advertisementService.selectPositionChart()
        );
    }


    // =========================================================
    // 광고 연장률
    // =========================================================

    @Operation(
        summary = "광고 연장률",
        description = "전체 결제 건 대비 연장 결제 비율을 조회합니다."
    )
    @GetMapping("/extension-rate")
    public ResponseEntity<Double> extensionRate() {

        return ResponseEntity.ok(
            advertisementService.selectExtensionRate()
        );
    }


    // =========================================================
    // 광고 위치별 CTR
    // =========================================================

    @Operation(
        summary = "광고 위치별 CTR",
        description = "최근 7일 기준 광고 위치별 CTR을 조회합니다."
    )
    @GetMapping("/position-ctr")
    public ResponseEntity<List<AdvertisementChartDto>> positionCtrChart() {

        return ResponseEntity.ok(
            advertisementService.selectPositionCtrChart()
        );
    }


    // =========================================================
    // AI 운영 분석
    // =========================================================

    @Operation(
        summary = "AI 광고 운영 분석",
        description = "최근 생성된 AI 광고 운영 분석 결과를 조회합니다."
    )
    @GetMapping("/ai-summary")
    public ResponseEntity<DashboardAiDto> aiSummary() {

        DashboardAiDto dto =
            advertisementService.getLatestAiSummary();

        if (dto == null) {

            dto = new DashboardAiDto();

            dto.setSummary("아직 생성된 AI 분석이 없습니다.");
            dto.setCreatedAt("-");
        }

        return ResponseEntity.ok(dto);
    }
}
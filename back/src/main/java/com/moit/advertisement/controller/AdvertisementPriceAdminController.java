package com.moit.advertisement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moit.advertisement.dto.AdvertisementPositionPriceDto;
import com.moit.advertisement.dto.AdvertisementPriceDto;
import com.moit.advertisement.service.AdvertisementPriceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/advertisement/price")
@Tag(
    name = "Admin Advertisement Price",
    description = "관리자 광고 가격 관리 API"
)
public class AdvertisementPriceAdminController {

    private final AdvertisementPriceService priceService;


    // =========================================================
    // 광고 가격 목록
    // GET /api/admin/advertisement/price
    // =========================================================
    @Operation(
        summary = "광고 가격 목록 조회",
        description = "관리자가 등록된 광고 가격 목록을 조회합니다."
    )
    @GetMapping
    public ResponseEntity<List<AdvertisementPriceDto>> findAll() {

        return ResponseEntity.ok(
                priceService.findAll()
        );
    }


    // =========================================================
    // 광고 가격 상세
    // GET /api/admin/advertisement/price/{priceId}
    // =========================================================
    @Operation(
        summary = "광고 가격 상세 조회",
        description = "가격 ID를 이용하여 광고 가격 정보를 조회합니다."
    )
    @GetMapping("/{priceId}")
    public ResponseEntity<AdvertisementPriceDto> findOne(
    		@PathVariable("priceId") Long priceId) {

        return ResponseEntity.ok(
                priceService.findOne(priceId)
        );
    }


    // =========================================================
    // 광고 가격 등록
    // POST /api/admin/advertisement/price
    // =========================================================
    @Operation(
        summary = "광고 가격 등록",
        description = "관리자가 결제 유형, 광고 등급, 광고 기간별 가격을 등록합니다."
    )
    @PostMapping
    public ResponseEntity<AdvertisementPriceDto> save(
            @RequestBody AdvertisementPriceDto dto) {

        return ResponseEntity.ok(
                priceService.save(dto)
        );
    }


    // =========================================================
    // 광고 가격 수정
    // PUT /api/admin/advertisement/price/{priceId}
    // =========================================================
    @Operation(
        summary = "광고 가격 수정",
        description = "관리자가 기존 광고 가격 정보를 수정합니다."
    )
    @PutMapping("/{priceId}")
    public ResponseEntity<AdvertisementPriceDto> update(
            @PathVariable("priceId") Long priceId,
            @RequestBody AdvertisementPriceDto dto) {

        return ResponseEntity.ok(
                priceService.update(priceId, dto)
        );
    }
    
 // =========================================================
    // 위치별 추가금 목록 조회
    // GET /api/admin/advertisement/price/position
    // =========================================================
    @GetMapping("/position")
    public ResponseEntity<List<AdvertisementPositionPriceDto>> findAllPositionPrices() {
        return ResponseEntity.ok(priceService.findAllPositionPrices());
    }

    // =========================================================
    // 위치별 추가금 수정
    // PUT /api/admin/advertisement/price/position/{id}
    // =========================================================
    @PutMapping("/position/{id}")
    public ResponseEntity<Void> updatePositionPrice(
            @PathVariable("id") Long id,
            @RequestBody AdvertisementPositionPriceDto dto) {
        
        priceService.updatePositionPrice(id, dto.getAdditionalPrice());
        return ResponseEntity.ok().build();
    }
}
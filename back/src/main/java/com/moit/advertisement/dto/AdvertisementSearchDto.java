package com.moit.advertisement.dto;

import com.moit.advertisement.enums.AdStatus;
import com.moit.advertisement.enums.ApprovalStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AdvertisementSearchDto {

    // 검색 조건
    private String searchText;   // 제목 검색

    private String status;          // OPEN / PENDING / CLOSED
    private ApprovalStatus approvalStatus;  // WAITING / APPROVED / REJECTED
    
    // 광고주
    private Long advertiserId;

    // 페이징
    @Min(value = 1, message = "페이지는 1 이상이어야 합니다.")
    private int page = 1;   // 기본 1페이지
    
    @Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다.")
    @Max(value = 100, message = "페이지 크기는 100 이하로 설정해주세요.")
    private int size = 10;  // 기본 10개

    // 정렬
    private String sort;        
    private String orderType;   // 기존 호환용

    public String getSort() {
        return sort != null ? sort : orderType;
    }
    
    // 자동 계산용
    public int getOffset() {
        return (page - 1) * size;
    }
}
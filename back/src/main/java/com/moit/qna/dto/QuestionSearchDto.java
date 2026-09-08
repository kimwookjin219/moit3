package com.moit.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 문의 검색 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionSearchDto {
    private String type;
    private String keyword;

    private String status;
    private String startDate;
    private String endDate;
}
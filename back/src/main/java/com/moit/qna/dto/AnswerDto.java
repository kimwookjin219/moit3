package com.moit.qna.dto;

import java.sql.Timestamp;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class AnswerDto {

    // 답변 등록/수정 요청 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AnswerRequestDto {
        private Long answerId;
        private Long questionId;
        private Long memberId;

        private String content;
        private String isPublic;
    }

    // 답변 조회 응답 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AnswerResponseDto {
        private Long answerId;
        private Long questionId;
        private Long memberId;

        private String content;
        private String isPublic;
        private String deleteYn;

        private Integer rating;
        private String feedback;

        private Timestamp createdAt;
        private Timestamp updatedAt;

        private String memberName;
    }
    
    // 답변 만족도 평가 요청 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SatisfactionRequestDto {
        private Long answerId;
        @NotNull @Min(1) @Max(5)
        private Integer rating;
        private String feedback;
    }
}
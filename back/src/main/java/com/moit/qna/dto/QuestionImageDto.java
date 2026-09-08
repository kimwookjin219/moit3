package com.moit.qna.dto;

import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 문의 이미지 응답 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionImageDto {
    private Long imageId;
    private Long questionId;
    private String originalName;
    private String storedName;
    private String imagePath;
    private Long imageSize;
    private String contentType;
    private String deleteYn;
    private Timestamp createdAt;
    private Timestamp updatedAt;

}
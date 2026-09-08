package com.moit.qna.ai.dto;

import lombok.Data;

@Data
public class AiAnalysisResult {

    private String analysis;
    private int score;
    private String aiCategory;

}
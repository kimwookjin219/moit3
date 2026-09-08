package com.moit.qna.dto; 

import lombok.Data; 

@Data 
public class QuestionAiAnalysisDto { 
	private Long questionId; 
	private String analysisStatus; 
	private int aggressionScore; 
    private String aiCategory;
	
}
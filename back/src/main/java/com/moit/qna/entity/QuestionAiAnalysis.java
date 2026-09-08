package com.moit.qna.entity;

import com.moit.qna.enums.AnalysisStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "QUESTION_AI_ANALYSIS")
@Getter @Setter
public class QuestionAiAnalysis {

    @Id
    @Column(name = "QUESTION_ID")
    private Long questionId;

	@Enumerated(EnumType.STRING)
	@Column(name = "ANALYSIS_STATUS", length = 20, nullable = false)
    private AnalysisStatus analysisStatus;

    @Column(name = "AGGRESSION_SCORE")
    private Double aggressionScore;

    @Column(name = "AI_CATEGORY")
    private String aiCategory;
}
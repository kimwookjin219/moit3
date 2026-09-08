package com.moit.qna.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.qna.ai.OpenAiService;
import com.moit.qna.ai.ProfanityFilter;
import com.moit.qna.ai.dto.AiAnalysisResult;
import com.moit.qna.dao.QuestionMapper;
import com.moit.qna.dto.QuestionAiAnalysisDto;
import com.moit.qna.repository.QuestionAiAnalysisRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionAiAnalysisService {
    private final OpenAiService openAiService;
    private final QuestionMapper questionMapper;
    private final ProfanityFilter profanityFilter;
    private final QuestionAiAnalysisRepository questionAiAnalysisRepository;

    public void analyzeAndSave(Long questionId, String text) {
        QuestionAiAnalysisDto dto = new QuestionAiAnalysisDto();
        dto.setQuestionId(questionId);
        
        // 1차 필터
        if (profanityFilter.containsBadWord(text)) {
            dto.setAnalysisStatus("PENDING_REVIEW");
            dto.setAggressionScore(99);
            dto.setAiCategory("OTHER");
            questionMapper.insertAiAnalysis(dto);
            return;
        }
        
        // 2차 AI 분석
        try {
            AiAnalysisResult result = openAiService.analyze(text);
            dto.setAnalysisStatus(result.getAnalysis());
            dto.setAggressionScore(result.getScore());
            dto.setAiCategory(result.getAiCategory());
        } catch (Exception e) {
            dto.setAnalysisStatus("PENDING_REVIEW");
            dto.setAggressionScore(0);
            dto.setAiCategory("OTHER");
        }
        questionMapper.insertAiAnalysis(dto);
    }

    // 검토 완료 처리
    @Transactional
    public void changeToNormal(List<Long> ids) {
        for (Long id : ids) { questionAiAnalysisRepository.changeToNormal(id);
        }
    }
}
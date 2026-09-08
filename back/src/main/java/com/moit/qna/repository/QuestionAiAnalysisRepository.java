package com.moit.qna.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.moit.qna.entity.QuestionAiAnalysis;
import jakarta.transaction.Transactional;

public interface QuestionAiAnalysisRepository extends JpaRepository<QuestionAiAnalysis, Long> {
    @Modifying
    @Query("""
        UPDATE QuestionAiAnalysis q
        SET q.analysisStatus = 'NORMAL'
        WHERE q.questionId = :questionId
    """)
    void changeToNormal(@Param("questionId") Long questionId);

}
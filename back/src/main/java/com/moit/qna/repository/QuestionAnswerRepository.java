package com.moit.qna.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.qna.entity.QuestionAnswer;

public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {
    // 질문당 답변은 1개
    Optional<QuestionAnswer> findByQuestion_Id(Long questionId);
    
    // 답변 만족도 평가 수정
    @Modifying
    @Query("""
        UPDATE QuestionAnswer a
           SET a.rating = :rating,
               a.feedback = :feedback
         WHERE a.answerId = :answerId
    """)
    int updateSatisfaction(
            @Param("answerId") Long answerId,
            @Param("rating") Integer rating,
            @Param("feedback") String feedback
    );
    
    // 답변 만족도 삭제 후 재작성가능하게
    @Modifying
    @Query("""
        UPDATE QuestionAnswer a
           SET a.rating = NULL,
               a.feedback = NULL
         WHERE a.answerId = :answerId
    """)
    int deleteSatisfaction(@Param("answerId") Long answerId);
    
    // 답변 ID로 질문 작성자 ID 조회
    @Query("""
        SELECT a.question.member.id
        FROM QuestionAnswer a
        WHERE a.answerId = :answerId
    """)
    Long findQuestionWriterIdByAnswerId(@Param("answerId") Long answerId);
}
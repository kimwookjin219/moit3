package com.moit.qna.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.qna.entity.QuestionImage;

public interface QuestionImageRepository extends JpaRepository<QuestionImage, Long> {
    // 문의별 첨부 이미지 조회
    List<QuestionImage> findByQuestion_Id(Long questionId);

    // 특정 이미지 논리 삭제
    @Modifying
    @Query("""
            UPDATE QuestionImage qi
            SET qi.deleteYn = 'Y'
            WHERE qi.id = :imageId
            """)
    void deleteByImageId(@Param("imageId") Long imageId);

    // 해당 문의의 이미지 논리 삭제
    @Modifying
    @Query("""
            UPDATE QuestionImage qi
            SET qi.deleteYn = 'Y'
            WHERE qi.question.id = :questionId
            """)
    void deleteByQuestionId(@Param("questionId") Long questionId);

    // 문의의 이미지 개수
    long countByQuestion_Id(Long questionId);
    
}
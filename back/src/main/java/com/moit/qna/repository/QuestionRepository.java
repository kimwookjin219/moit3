package com.moit.qna.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.moit.qna.entity.Question;
import com.moit.qna.enums.QnaStatus;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    // 답변 등록 시 문의 상태 변경
    @Modifying
    @Query("""
            UPDATE Question q
            SET q.status = 'ANSWERED'
            WHERE q.id = :questionId
            """)
    void updateStatusAnswered(@Param("questionId") Long questionId);

    // 답변 삭제 시 문의 상태 변경
    @Modifying
    @Query("""
            UPDATE Question q
            SET q.status = 'PENDING'
            WHERE q.id = :questionId
            """)
    void updateStatusPending(@Param("questionId") Long questionId);

    // 제목, 내용 검색
    @Query("""
            SELECT q
            FROM Question q
            WHERE q.title LIKE %:keyword%
            OR q.content LIKE %:keyword%
            """)
    List<Question> findBySearch(@Param("keyword") String keyword);

    // 사용자 문의 목록
    List<Question> findByMember_Id(Long memberId);

    // 부모 문의 조회
    List<Question> findByParentId(Integer parentId);

    // 상태별 개수
    long countByStatusAndDeleteYn(QnaStatus status, Character deleteYn);

}
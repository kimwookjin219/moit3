package com.moit.review.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.review.entity.ReviewComment;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

    // 삭제되지 않은('N') 최상위 댓글 조회 
    @EntityGraph(attributePaths = {"member", "children", "children.member"})
    List<ReviewComment> findByReviewIdAndParentIsNullAndDeleteYnOrderByCreatedAtAsc(Long reviewId, Character deleteYn);

    // 💡 [수정] 특정 리뷰에 특정 회원이 작성한 "삭제되지 않은('N')" 최상위 댓글이 이미 존재하는지 확인
    boolean existsByReviewIdAndMemberIdAndParentIsNullAndDeleteYn(Long reviewId, Long memberId, Character deleteYn);

}
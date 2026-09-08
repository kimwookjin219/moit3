package com.moit.review.entity;

import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
	    name="REVIEW_LIKES",
	    uniqueConstraints = {
	        @UniqueConstraint(
	            name = "UK_REVIEW_MEMBER_LIKE",
	            columnNames = {"REVIEW_ID", "MEMBER_ID"}
	        )
	    }
	)
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA용 기본 생성자
public class ReviewLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REVIEW_ID", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    // ★ 클래스 전체가 아닌 빌더를 사용할 생성자에 직접 선언합니다.
    @Builder
    public ReviewLike(Review review, Member member) {
        this.review = review;
        this.member = member;
    }
}
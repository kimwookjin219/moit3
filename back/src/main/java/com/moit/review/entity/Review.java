package com.moit.review.entity;

import java.util.ArrayList;
import java.util.List;

import com.moit.meetup.entity.Meetup;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist; // 1. 임포트 추가
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="REVIEWS")
@Builder
@NoArgsConstructor  
@AllArgsConstructor 
public class Review extends BaseEntity{
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(unique=true,nullable=false)
	private Long id;
	
	//모임번호
	@ManyToOne(fetch = FetchType.LAZY) 
	@JoinColumn(name="MEETUP_ID" ,nullable=false)
	private Meetup meetup;
	
	//작성자 번호
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="MEMBER_ID" ,nullable=false)
	private Member member;
	
	@OneToMany(mappedBy="review",cascade=CascadeType.ALL,orphanRemoval=true)
	private List<ReviewImage> reviewImages=new ArrayList<>();
	
	//후기 내용
	@Lob
	@Column(nullable=false)
	private String content;
	
	//별점
	@Column
	private Integer rating;
	
	//좋아요수
	@Column
    private Integer likesCount = 0;
	
	//조회수
	@Column
	private Integer viewsCount = 0;
	
	//공개여부
	@Column(length=1)
	private String isPublic = "Y";

	// 2. DB에 저장되기 직전 실행되는 메서드 추가
	@PrePersist
	public void prePersist() {
		if (this.likesCount == null) {
			this.likesCount = 0;
		}
		if (this.viewsCount == null) {
			this.viewsCount = 0;
		}
		if (this.isPublic == null) {
			this.isPublic = "Y";
		}
	}
}
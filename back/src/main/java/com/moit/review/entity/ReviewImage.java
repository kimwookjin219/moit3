package com.moit.review.entity;

import com.moit.common.entity.Image;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="REVIEW_IMAGES")
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class ReviewImage extends BaseEntity {
	
	
	//후기번호
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	//후기 아이디 어떤후기에 저장된 이미지
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="REVIEW_ID",nullable=false)
	private Review review;
	
	//이미지 번호
	@OneToOne(fetch=FetchType.LAZY)
	@JoinColumn(name = "IMAGE_ID", nullable = false)
	private Image image;
}

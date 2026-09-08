package com.moit.member.entity;

import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "point_history")
@Getter @Setter
@NoArgsConstructor
public class PointHistory extends BaseEntity{
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "point_history_seq")
	@SequenceGenerator(name = "point_history_seq", sequenceName = "point_history_seq", allocationSize = 1)
	@Column(name = "history_id")
	private Long historyId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
	
	@Column(name = "point_pm", nullable = false)
	private Integer pointPm;
	
	@Column(name = "point_type", nullable = false, length = 30)
	private String pointType;
	
	@Column(name = "point_reason", nullable = false, length = 100)
	private String pointReason;
	
}

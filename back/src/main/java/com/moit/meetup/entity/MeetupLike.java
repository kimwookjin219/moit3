package com.moit.meetup.entity;

import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Builder
@Setter
@Table(name="MEETUP_LIKES", uniqueConstraints = {@UniqueConstraint(columnNames = {"MEMBER_ID","MEETUP_ID"})})
public class MeetupLike extends BaseEntity{

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name="MEMBER_ID", nullable = false)
	private  Member member;	
	
	@ManyToOne
	@JoinColumn(name="MEETUP_ID",  nullable = false)
	private Meetup meetup;
}

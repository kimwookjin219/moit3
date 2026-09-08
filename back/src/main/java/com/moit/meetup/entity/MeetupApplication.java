package com.moit.meetup.entity;

import java.util.List;

import com.moit.meetup.enums.ApplyStatus;
import com.moit.meetup.enums.MeetupStatus;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="meetup_applications")
public class MeetupApplication extends BaseEntity{

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private Long id;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ApplyStatus applyStatus;
	
	@Column
	private String rejectReason;
	
	@ManyToOne
	@JoinColumn(name="meetup_id", nullable = false)
	private Meetup meetup;
	
	@ManyToOne
	@JoinColumn(name="member_id", nullable = false)
	private  Member member;	
}

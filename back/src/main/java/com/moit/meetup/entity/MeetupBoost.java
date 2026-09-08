package com.moit.meetup.entity;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;

import com.moit.member.entity.PointHistory;
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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="MEETUP_BOOSTS")
public class MeetupBoost extends BaseEntity{
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "meetup_id", nullable = false)
	private Meetup meetup;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "history_id", nullable = false)
	private PointHistory pointHistory;
	
	@CreationTimestamp
	@Column(nullable = false, updatable = false)
    private LocalDate startDate;
	
	@Column(nullable = false)
    private LocalDate endDate;
}

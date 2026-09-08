package com.moit.meetup.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.moit.common.entity.Sigungu;
import com.moit.meetup.enums.MeetupStatus;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name="MEETUPS")
public class Meetup extends BaseEntity{ //  extends BaseEntity -> 이렇게하면 공통 컬럼 추가됩니다. 경로 따라가서 확인해보세요.
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private Long id;
	
	@Column(length = 50)
	private String title;
	
	@Lob
	@Column
	private String content;
	
	@Column
	private Integer maxParticipants;
	
	@Column
	private Integer minParticipants;
	
	@Column
	private String address;
	
	@Column
	private String addressDetail;
	
	@Column
	private LocalDateTime meetupAt;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private MeetupStatus meetupStatus;
	
	@Column
	private Double latitude;
	
	@Column
	private Double longitude;
	
	@Column
	private Integer nx;
	
	@Column
	private Integer ny;
	
	@Builder.Default
	@Column(nullable = false, columnDefinition = "NUMBER(1) DEFAULT 0")
	private Boolean hidden = false;
	
	@ManyToOne
	@JoinColumn(name = "member_id", nullable = false)
	private  Member member;
	
	@OneToMany(mappedBy = "meetup", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MeetupApplication> meetupApplications;
	
	@OneToMany(mappedBy = "meetup", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MeetupImage> meetupImages = new ArrayList<>();
	
	@ManyToOne
	@JoinColumn(name = "meetupCategory_id", nullable = false)
	private MeetupCategory meetupCategory;	
	
	@ManyToOne
	@JoinColumn(name = "sigungu_id", nullable = false)
	private Sigungu sigungu;
	
	@OneToMany(mappedBy = "meetup", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MeetupLike> meetupLike;
}
package com.moit.member.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member_interest")
@Getter @Setter
@NoArgsConstructor
public class MemberInterest {
	
	@EmbeddedId
    private MemberInterestId id;
	
//	@Id
//	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "member_interest_seq")
//	@SequenceGenerator(name = "member_interest_seq", sequenceName = "member_interest_seq", allocationSize = 1)
//	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("memberId")
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("interestId")
	@JoinColumn(name = "interest_id", nullable = false)
	private Interest interest;
}

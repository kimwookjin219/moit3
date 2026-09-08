package com.moit.member.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class MemberInterestId implements Serializable{
	
	@Column(name = "member_id")
	private Long memberId;
	
	@Column(name = "interest_id")
	private Long interestId;
}

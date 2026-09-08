package com.moit.member.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "interest")
@Getter @Setter
@NoArgsConstructor
public class Interest {
	
	@Id
	@Column(name = "interest_id")
	private Long interestId;
	
	@Column(name = "interest_name",nullable = false)
	private String interestName;
	
	@OneToMany(mappedBy = "interest")
	private List<MemberInterest> memberInterests = new ArrayList<>();
}

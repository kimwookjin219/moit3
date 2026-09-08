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
@Table(name = "member_status")
@Getter @Setter
@NoArgsConstructor
public class MemberStatus {
	
	@Id
	@Column(name = "status_id")
	private Long statusId;
	
	@Column(name = "status_name", nullable = false, unique = true, length = 30)
	private String statusName;
	
	@OneToMany(mappedBy = "memberStatus")
	private List<Member> members = new ArrayList<>();
}

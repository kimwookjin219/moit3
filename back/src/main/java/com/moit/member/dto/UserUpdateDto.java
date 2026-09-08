package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class UserUpdateDto {
	private String nickname;
	private String mobile;
	private String email;
	private String profileUrl;
	private String gender;
	private LocalDate birth;
	private List<Integer> interestIds;
}

package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserUpdateRequestDto {
	
	private String nickname;
    private String mobile;
    private String profileUrl;
    private String gender;
    private LocalDate birth;

    private List<Integer> interestIds;
    private MultipartFile profileImage;
}

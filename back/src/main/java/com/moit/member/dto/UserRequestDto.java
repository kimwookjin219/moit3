package com.moit.member.dto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//회원가입 / 회원정보 수정 요청
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserRequestDto {
	
	@NotBlank
	private String loginId;
	
	@NotBlank
	@Email
	private String email;
		
	private String password;
	private String nickname;
	private String mobile;
	private Long  memberTypeId;
	private String gender;
	private LocalDate birth;
	private String provider;
	private String providerId;
	private MultipartFile profileImage;
	private List<Integer> interestIds;
	
	private String deviceId;
	
	// 회원가입 행동 데이터
	private SignupBehaviorDto signupBehavior;
	
	// requestDto -> 기존 UserDto로 반환
	public UserDto toUserDto() {
		UserDto dto = new UserDto();
		
		dto.setLoginId(loginId);
        dto.setEmail(email);
        dto.setPassword(password);
        dto.setNickname(nickname);
        dto.setMobile(mobile);
        dto.setMemberTypeId( memberTypeId != null ? memberTypeId : 1L );
        dto.setGender(gender);
        dto.setBirth(birth);
        dto.setProvider(provider);
        dto.setProviderId(providerId);
        dto.setProfileImage(profileImage);
        dto.setInterestIds(interestIds);
        dto.setSignupBehavior(signupBehavior);

        return dto;
	}
	
}

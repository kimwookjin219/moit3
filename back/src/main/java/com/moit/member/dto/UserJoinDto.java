package com.moit.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserJoinDto {	
	private String loginId;
	private String mobile;
	private String nickname;
	private String email;
	private String password;
	private String profileUrl;
	private Integer memberTypeId;
	private Integer statusId;
	private String gender;
	private LocalDate birth;
	
}
/*
 INSERT INTO members (
            login_id, mobile, nickname, email, password, member_type_id, status_id, profile_url
        ) VALUES (
            #{loginId}, #{mobile}, #{nickname}, #{email}, #{password}, #{memberTypeId}, #{statusId}, #{profileUrl}
        ) 
        
- 성별
    insert into member_info(gender) values(#{gender})

- 생년월일
    insert into member_info(birth) values(#{birth})         
*/
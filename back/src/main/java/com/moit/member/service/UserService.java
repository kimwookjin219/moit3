package com.moit.member.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.moit.member.dto.AuthUserDto;
import com.moit.member.dto.InterestDto;
import com.moit.member.dto.MyPageDto;
import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserJoinDto;
import com.moit.member.dto.UserUpdateRequestDto;
import com.moit.member.enums.PasswordChangeResultEnum;

public interface UserService {
	public int      	 insert(UserDto dto);  // 회원가입 + 권한추가
	public int           insertInfo(UserDto dto);
	public     AuthUserDto    readAuth( Map<String,Object> map); // 로그인 인증 정보 조회
	public UserDto  findUser(Map<String,Object> paramMap); // 아이디 중복검사, 닉네임 중복검사
	public int updateUser(UserDto dto); // 회원정보 수정 (닉네임,비밀번호,프로필,탈퇴,관리자승인/권한변경)
	public List<UserDto> select10(Map<String,Object> paramMap); // 회원리스트 페이징 조회
	public int selectCnt(Map<String,Object> paramMap); // 조건별 전체 회원 수 조회
	public int deleteUser(String loginId); // 관리자기능 - 회원 삭제
	public boolean deleteMember(Long memberId , String password);
	public UserDto findByLoginId(UserDto dto);// 마이페이지
	public UserDto findId(UserDto dto); // 아이디 찾기
	public UserDto findPasswordUser(UserDto dto); // 비밀번호 찾기(정보조회)
	public boolean changePassword(UserDto dto); // 비밀번호 재발급(변경)
	//boolean changePassword( int memberId, String currentPassword, String newPassword ); // 비밀번호 변경
	PasswordChangeResultEnum changePassword(Long memberId, String currentPassword, String newPassword);
	public UserDto findByMemberId( Long memberId);
	
	/* security login */
	public AuthUserDto readByLoginId(UserDto dto); //로그인	
	public void insertSocialInfo(UserDto dto);
	
	// 추후 삭제될 수도 있는 코드
	public List<String> getInterestList(Long memberId);//관심사
	//public void completeSocialJoin(UserDto dto);
	List<InterestDto> getAllInterest();
	List<Integer> getInterestIds(Long memberId);
	public void updateInterest( Long memberId, List<Integer> interestIds );
	
	// 버전업 하면서 새로 추가된 코드
	// 중복확인
	public boolean existsByEmail(String email);
	public boolean existsByNickname(String nickname);
	public boolean existsByLoginId(String loginId);
	public boolean existsByMobile(String mobile);
	// 정보 수정
	UserDto updateMember(Long memberId, UserUpdateRequestDto request);
}

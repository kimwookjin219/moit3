package com.moit.member.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.moit.member.dto.AuthUserDto;
import com.moit.member.dto.InterestDto;
import com.moit.member.dto.MyPageDto;
import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserJoinDto;

@Mapper
public interface UserMapper {
	// 1. 회원가입 (일반, 제휴업체, 관리자 공통 사용 가능)
    int insert(UserDto dto);
    int insertInfo(UserDto dto);
    
    // 2. 로그인 인증 정보 조회
    AuthUserDto readAuth(Map<String,Object> map);

    // 3. 회원 단건 검색 (아이디 중복검사, 닉네임 중복검사 시 활용)
    UserDto findUser(Map<String, Object> paramMap);

    // 4. 회원 정보 동적 수정 (닉네임/비밀번호/프로필 변경 및 탈퇴 처리, 관리자 승인/권한변경 공통)
    int updateUser(UserDto dto);

    // 5. 회원 리스트 페이징 조회 (조건별 동적 바인딩 가능)
    List<UserDto> select10(Map<String, Object> paramMap);

    // 6. 조건별 전체 회원 수 조회 (페이징 블록 계산용)
    int selectCnt(Map<String, Object> paramMap);

    // 7. 관리자 기능 - 회원 물리 삭제
    int deleteUser(String loginId);
    
    int deleteYn(String loginId);
    
    //8. 마이페이지(회원조회)
    UserDto findByLoginId(UserDto dto);
    // 마이페이지 (관심사)
    List<String> selectInterestList(Long memberId);
    
    //9. 아이디 찾기
    UserDto findId(UserDto dto);
    
    //10. 비밀번호 찾기(회원확인)
    UserDto findPasswordUser(UserDto dto);
    
    //11. 비밀번호변경
    int changePassword(UserDto dto);
    
    UserDto findByMemberId(Long memberId);
    
    //12. 회원탈퇴
    boolean deleteMember(Long memberId);
    
    //13. 관심사
    int insertMemberInterest(Map<String,Object> map);
    
    List<Integer> selectInterestIds(Long memberId);

    List<InterestDto> selectAllInterest();

    int deleteMemberInterest(Long memberId);

    int insertMemberInterest( @Param("memberId") Long memberId, @Param("interestId") Integer interestId );
    
    /* security */
    // 로그인
    AuthUserDto readByLoginId(String username);
    
    
    /* social */
    int connectProvider(UserDto dto);
    UserDto findByEmail(String email);
    UserDto findByProvider(UserDto dto);
    int insertSocial(UserDto dto);
    int insertSocialInfo(UserDto dto);
    void updateSocialInfo(UserDto dto);
    int updateMemberInfo(UserDto dto);
}

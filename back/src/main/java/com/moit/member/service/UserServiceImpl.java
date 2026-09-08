package com.moit.member.service;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.dao.UserMapper;
import com.moit.member.dto.AuthUserDto;
import com.moit.member.dto.InterestDto;
import com.moit.member.dto.UserDto;
import com.moit.member.dto.UserUpdateRequestDto;
import com.moit.member.enums.PasswordChangeResultEnum;
import com.moit.security.PasswordLeakService;

@Service
public class UserServiceImpl  implements UserService{
 
	@Autowired  UserMapper dao;
	@Autowired  @Qualifier("passwordEncoder") PasswordEncoder  pwencoder;
	@Autowired PasswordLeakService passwordLeakService;
	
	@Value("${resource.path}") private String resourcePath;
	
	@Override
	public int insert(UserDto dto) {
		Map<String, Object> map = new HashMap<>();
		
		//아이디 중복검사
		map.put("loginId", dto.getLoginId());
		if(dao.findUser(map)!= null) { return 0; }
		
		map.clear();
		
		// 닉네임 중복검사
		map.put("nickname", dto.getNickname());
		if(dao.findUser(map) != null) { return -1; }
				
		map.clear();
		
		// 전화번호 중복검사
		map.put("mobile", dto.getMobile());
		if(dao.findUser(map) != null) { return -3; }
		
		// 비밀번호 암호화 
		dto.setPassword(pwencoder.encode(dto.getPassword()));
		
		// 회원 분류
		if(dto.getMemberTypeId()==1) { dto.setStatusId(1L); } // 일반
		else if(dto.getMemberTypeId()==2) { dto.setStatusId(2L); } // 제휴업체
		else if(dto.getMemberTypeId()==3) { dto.setStatusId(2L); } // 관리자
		
		if(dto.getProfileUrl() == null) {
		    dto.setProfileUrl("/images/moit.png");
		}
		
		int result = dao.insert(dto);
		if(result == 1){

		    if(dto.getMemberTypeId() != 3){ dao.insertInfo(dto); }

		    if(dto.getInterestIds() != null){
		        for(Integer interestId : dto.getInterestIds()){

		            Map<String,Object> interestMap = new HashMap<>();

		            interestMap.put("memberId", dto.getMemberId());
		            interestMap.put("interestId", interestId);

		            dao.insertMemberInterest(interestMap);
		        }
		    }
		}
		return 1;
	}
	
	@Override public AuthUserDto readAuth(Map<String,Object> map) { return dao.readAuth(map); }
	
	@Override public UserDto findUser(Map<String, Object> paramMap) { return dao.findUser(paramMap); }
	
	@Transactional
	@Override 
	public int updateUser(UserDto dto) { 
		
        if (dto.getProfileImage() != null && !dto.getProfileImage().isEmpty()) {

            try {

                // UUID 생성 (파일명 중복 방지)
                String uuid = UUID.randomUUID().toString();

                // 원본 파일명
                String originalName = dto.getProfileImage().getOriginalFilename();

                // 확장자 추출
                String ext = originalName.substring(originalName.lastIndexOf("."));

                // 저장될 파일명
                String saveName = uuid + ext;

                // 저장 폴더 생성
                String uploadPath = resourcePath + "/profile/";
                
                File dir = new File(uploadPath);

                if (!dir.exists()) { dir.mkdirs(); }

                UserDto oldUser = dao.findByMemberId(dto.getMemberId());

                if (oldUser != null &&
                        oldUser.getProfileUrl() != null &&
                        !oldUser.getProfileUrl().equals("/images/moit.png")) {

                    File oldFile =
                            new File(uploadPath,
                                    oldUser.getProfileUrl().replace("/upload/profile/", ""));
                    if (oldFile.exists()) {
                        oldFile.delete();
                    }
                }

                dto.getProfileImage()
                        .transferTo(new File(uploadPath + saveName));

                // DB에는 URL만 저장
                dto.setProfileUrl("/upload/profile/" + saveName);

            } catch (Exception e) {
                e.printStackTrace();
                return 0;
            }
        }
		
		int result1 = dao.updateUser(dto);
	    int result2 = dao.updateMemberInfo(dto);
		
	    if(result1 > 0 || result2 > 0){
	        return 1;
	    }
		
		return 0; 
	}
	
	@Override public List<UserDto> select10(Map<String, Object> paramMap) { return dao.select10(paramMap); }
	
	@Override public int selectCnt(Map<String, Object> paramMap) { return dao.selectCnt(paramMap); }
	
	@Override public int deleteUser(String loginId) { return dao.deleteUser(loginId); }

	@Override public UserDto findByLoginId(UserDto dto) {  return dao.findByLoginId(dto); }

	@Override public int insertInfo(UserDto dto) { return dao.insertInfo(dto); }

	@Override public AuthUserDto readByLoginId(UserDto dto) {  return dao.readByLoginId(dto.getLoginId()); }

	@Override public UserDto findId(UserDto dto) { return dao.findId(dto); }
	
	@Override public UserDto findPasswordUser(UserDto dto) { return dao.findPasswordUser(dto); }
	
	//비밀번호 찾기 후 변경
	@Override
	public boolean changePassword(UserDto dto) {
		
		int leakCount = passwordLeakService.getLeakCount(dto.getPassword());
		
		if(leakCount > 0) { return false; }
		
		dto.setPassword(pwencoder.encode(dto.getPassword()));		
		
		return dao.changePassword(dto) > 0;
	}
	
//	@Transactional
//	@Override
//	public void completeSocialJoin(UserDto dto) {
//		dao.updateSocialInfo(dto);
//        dao.updateMemberInfo(dto);
//	}
	
	@Transactional
	@Override
	public void insertSocialInfo(UserDto dto) {
		dto.setPassword(pwencoder.encode(UUID.randomUUID().toString()));
		
		dto.setLoginId(dto.getProvider() + "-" + dto.getProviderId());
		
		dto.setMemberTypeId(1L);
		dto.setStatusId(1L);
		
		dao.insertSocial(dto);
		dao.insertSocialInfo(dto);
	}
	
	@Override public UserDto findByMemberId(Long memberId) { return dao.findByMemberId(memberId); }
	
	// 로그인 후 비밀번호 변경
//	@Override
//	public boolean changePassword(int memberId, String currentPassword, String newPassword) {
//		UserDto user = dao.findByMemberId(memberId);
//		
//		if(!pwencoder.matches(currentPassword, user.getPassword())) {
//			return false;
//		}
//		
//		int leakCount = passwordLeakService.getLeakCount(newPassword);
//		
//		if(leakCount > 0) {return false;}
//		
//		UserDto dto = new UserDto();
//		
//		dto.setMemberId(memberId);
//		dto.setPassword(pwencoder.encode(newPassword));
//		
//		dao.changePassword(dto);
//		
//		return true;
//	}
	@Override
	public PasswordChangeResultEnum changePassword(
			Long memberId,
	        String currentPassword,
	        String newPassword) {
		
	    UserDto user = dao.findByMemberId(memberId);

	    // 현재 비밀번호 확인
	    if (!pwencoder.matches(currentPassword, user.getPassword())) {
	        return PasswordChangeResultEnum.WRONG_PASSWORD;
	    }

	    // HIBP 검사  임시 주석처리
//	    int leakCount = passwordLeakService.getLeakCount(newPassword);
//
//	    if (leakCount == -1) {  return PasswordChangeResult.API_ERROR;  }
//	    if (leakCount > 0) {  return PasswordChangeResult.LEAKED_PASSWORD;  }

	    UserDto dto = new UserDto();

	    dto.setMemberId(memberId);
	    dto.setPassword( pwencoder.encode(newPassword) );

	    dao.changePassword(dto);
	    
	    return PasswordChangeResultEnum.SUCCESS;
	}
	
	@Transactional
	@Override
	public boolean deleteMember(Long memberId,String password) {

		UserDto user = dao.findByMemberId(memberId);
		
		if(!pwencoder.matches(password, user.getPassword())) { return false; }
		
		dao.deleteMember(memberId);
		
		return true;
	}
	
	
	@Override
	public List<String> getInterestList(Long memberId) { return dao.selectInterestList(memberId); }

	@Override
	public void updateInterest(Long memberId, List<Integer> interestIds) {
		
		// 기존 관심사 삭제
		dao.deleteMemberInterest(memberId);
		
		// 새 관심사 저장
		if(interestIds != null){
		        for(Integer interestId : interestIds){ dao.insertMemberInterest( memberId, interestId ); }
		    }		
		}

	@Override public List<InterestDto> getAllInterest() { return dao.selectAllInterest(); }

	@Override public List<Integer> getInterestIds(Long memberId) { return dao.selectInterestIds(memberId); }

	
	// 버전업 추가 코드
	// 중복검사
	@Override
	public boolean existsByEmail(String email) {
		Map<String,Object> map = new HashMap<>();
		map.put("email", email);
		
		return dao.findUser(map) != null;
	}

	@Override
	public boolean existsByNickname(String nickname) {
		Map<String,Object> map = new HashMap<>();
		map.put("nickname", nickname);
		
		return dao.findUser(map) != null;
	}

	@Override
	public boolean existsByLoginId(String loginId) {
		Map<String,Object> map = new HashMap<>();
		map.put("loginId", loginId);
		
		return dao.findUser(map) != null;
	}

	@Override
	public boolean existsByMobile(String mobile) {
		Map<String,Object> map = new HashMap<>();
		map.put("mobile", mobile);
		
		return dao.findUser(map) != null;
	}
	
	@Transactional
	@Override
	public UserDto updateMember(Long memberId, UserUpdateRequestDto request) {
		
		UserDto user = dao.findByMemberId(memberId);
		
		if(user == null) { return null; }
		
		// 닉네임 변경 중복확인
		if(!user.getNickname().equals(request.getNickname())) {
			Map<String,Object> map = new HashMap<>();
			map.put("nickname", request.getNickname());
			
			UserDto duplicate = dao.findUser(map);
			
			if(duplicate != null && !duplicate.getMemberId().equals(memberId)) {
				throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
			}
		}
		
		UserDto dto = new UserDto();
		
		dto.setMemberId(memberId);
		dto.setLoginId(user.getLoginId());
		dto.setNickname(request.getNickname());
		//dto.setEmail(request.getEmail());
		dto.setMobile(request.getMobile());
		
		int result = dao.updateUser(dto);
		
		if(result==0) {
			throw new IllegalStateException("회원정보 수정에 실패했습니다.");
		}
		
		updateInterest(memberId, request.getInterestIds());
		
		// 수정된 회원정보
		UserDto updated = dao.findByMemberId(memberId);
		
		//수정된 관심사
		updated.setInterestIds(getInterestIds(memberId));
		
		
		return updated;
	}

	

	
	
	
	

}

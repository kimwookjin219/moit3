package com.moit.member.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.dto.MyPageDto;
import com.moit.member.dto.UserDto;
import com.moit.member.entity.Interest;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberInfo;
import com.moit.member.entity.MemberInterest;
import com.moit.member.entity.MemberInterestId;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.member.repository.InterestRepository;
import com.moit.member.repository.MemberInfoRepository;
import com.moit.member.repository.MemberInterestRepository;
import com.moit.member.repository.MemberRepository;
import com.moit.member.repository.MemberStatusRepository;
import com.moit.member.repository.MemberTypeRepository;
import com.moit.reports.entity.MemberReportStatus;
import com.moit.reports.repository.MemberReportStatusRepository;
import com.moit.security.PasswordLeakService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService{
	
	private final MemberRepository memberRepository;
	private final MemberInfoRepository memberInfoRepository;
	private final MemberTypeRepository memberTypeRepository;
	private final MemberStatusRepository memberStatusRepository;
	private final PasswordEncoder passwordEncoder;
	private final MemberInterestRepository memberInterestRepository;
	private final InterestRepository interestRepository;
	private final PasswordLeakService passwordLeakService;
	private final MemberReportStatusRepository memberReportStatusRepository;
	private final VerificationService verificationService;
	private final PhoneVerificationService phoneVerificationService;
	
	// 중복검사
	@Override
	public boolean existsByLoginId(String loginId) {
		return memberRepository.existsByLoginId(loginId);
	}
	@Override
	public boolean existsByEmail(String email) {
		return memberRepository.existsByEmail(email);
	}
	@Override
	public boolean existsByNickname(String nickname) {
		return memberRepository.existsByNickname(nickname);
	}	
	
	// 회원가입
	@Transactional
	@Override
	public UserDto signup(UserDto dto) {
		
		// 휴대폰 인증 여부 확인
	    if (!phoneVerificationService.isPhoneVerified(dto.getMobile())) {
	        throw new IllegalArgumentException("휴대폰 인증이 완료되지 않았습니다.");
	    }
		
		//회원 유형 조회
		MemberType memberType = memberTypeRepository.findById(dto.getMemberTypeId())
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원 유형입니다."));
		
		Long statusId;
		
		if(dto.getMemberTypeId() == 1L) {
			// 일반회원
			statusId = 1L;
		}
		else if(dto.getMemberTypeId() == 2L) {
			// 제휴업체
			statusId = 2L;
		}
		else if(dto.getMemberTypeId() == 3L) {
			// 일반 관리자
			statusId = 3L;
		}
		else {
			throw new IllegalArgumentException("잘못된 회원 유형입니다.");
		}
		
		// 회원 상태 조회
		MemberStatus memberStatus = memberStatusRepository.findById(statusId)
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원 상태입니다."));
		
		// 신고 상태 조회
		MemberReportStatus reportStatus = memberReportStatusRepository.findById(1L)
	            	.orElseThrow(() -> new IllegalArgumentException("신고 상태가 존재하지 않습니다.") );
		
		// 회원 생성
		Member member = new Member();
		
		member.setLoginId(dto.getLoginId());
		member.setMobile(dto.getMobile());
		member.setNickname(dto.getNickname());
		member.setEmail(dto.getEmail());
		
		// 비밀번호 유출 여부 확인
		int leakCount = passwordLeakService.getLeakCount(dto.getPassword());

		if (leakCount > 0) {
		    throw new IllegalArgumentException(
		        "사용하려는 비밀번호가 과거 데이터 유출에 포함된 적이 있습니다. 다른 비밀번호를 사용해주세요."
		    );
		}

		if (leakCount == -1) {
		    throw new IllegalArgumentException(
		        "비밀번호 보안 검증에 실패했습니다. 잠시 후 다시 시도해주세요."
		    );
		}
		
		// 비밀번호 암호화
		member.setPassword(passwordEncoder.encode(dto.getPassword()));
		
		// 프로필 이미지(기본 or 설정 이미지)
		if(dto.getProfileUrl() == null || dto.getProfileUrl().isBlank()) {
			member.setProfileUrl("/images/moit.png");
		}
		else {
			member.setProfileUrl(dto.getProfileUrl());
		}
		
		member.setMemberType(memberType);
		member.setMemberStatus(memberStatus);
		
		// 회원정보 저장
		memberRepository.save(member);
		
		// 회원 상세정보
		MemberInfo memberInfo = new MemberInfo();
		
		memberInfo.setMember(member);
		memberInfo.setGender(dto.getGender());
		memberInfo.setBirth(dto.getBirth());
		memberInfo.setMemberReportStatus(reportStatus);
		
		memberInfoRepository.save(memberInfo);
		
		// 회원 관심사
		if(dto.getInterestIds() != null) {
			for(Integer interestId  : dto.getInterestIds()) {
				Interest interest = interestRepository.findById(interestId.longValue())
									.orElseThrow(()-> new IllegalArgumentException("존재하지 않은 관심사입니다."));
				MemberInterest memberInterest = new MemberInterest();
				
				MemberInterestId id = new MemberInterestId(member.getId(),interest.getInterestId());
				
				memberInterest.setId(id);
				memberInterest.setMember(member);
				memberInterest.setInterest(interest);
				
				memberInterestRepository.save(memberInterest);
			}
		}
		
		// 휴대폰 인증 완료 상태 삭제
		phoneVerificationService.removePhoneVerified(dto.getMobile());		
		
		// DTO에 반영
		dto.setMemberId(member.getId());
		dto.setStatusId(statusId);
		dto.setProfileUrl(member.getProfileUrl());
		
		return dto;
		
	}
	
	// 로그인
	@Override
	public UserDto findByLoginId(String loginId) {
		
		Member member = memberRepository
	            .findByLoginIdAndDeleteYn(loginId, 'N')
	            .orElse(null);
		
		if(member == null) { return null; }
		
		// 회원 상세정보 조회
	    MemberInfo memberInfo = memberInfoRepository.findById(member.getId())
	            .orElse(null);
		
		UserDto dto = new UserDto();
		
		dto.setMemberId(member.getId());
	    dto.setLoginId(member.getLoginId());
	    dto.setPassword(member.getPassword());
	    dto.setEmail(member.getEmail());
	    dto.setNickname(member.getNickname());
	    dto.setMobile(member.getMobile());
	    dto.setProfileUrl(member.getProfileUrl());

	    dto.setMemberTypeId(member.getMemberType().getMemberTypeId());
	    dto.setStatusId(member.getMemberStatus().getStatusId());
	    
	    if(memberInfo != null) {
	        dto.setPoint(memberInfo.getPoint());
	        dto.setTrustScore(memberInfo.getTrustScore());	// 신고... 매너점수(신뢰도점수) & 뱃지
	    }
		
		return dto;
	}
	
	// JWT 회원조회
	@Override
	public UserDto findByMemberId(Long memberId) {
		
		Member member = memberRepository.findByIdAndDeleteYn(memberId, 'N').orElse(null);
		
		if (member == null) { return null; }
		
		MemberInfo memberInfo = memberInfoRepository.findById(memberId)
	            					.orElse(null);
		
		UserDto dto = new UserDto();
		
		dto.setMemberId(member.getId());
	    dto.setLoginId(member.getLoginId());
	    dto.setPassword(member.getPassword());
	    dto.setEmail(member.getEmail());
	    dto.setNickname(member.getNickname());
	    dto.setMobile(member.getMobile());
	    dto.setProfileUrl(member.getProfileUrl());
	    
	    dto.setProvider(member.getProvider());
	    dto.setProviderId(member.getProviderId());

	    dto.setMemberTypeId(member.getMemberType().getMemberTypeId());
	    dto.setStatusId(member.getMemberStatus().getStatusId());
	    
	    // 회원 가입일
	    if (member.getCreatedAt() != null) {
	        dto.setCreatedAt( member.getCreatedAt().toLocalDate().toString() );
	    }
	    
	    // 회원 상세정보
	    if(memberInfo != null) {
	    	dto.setGender(memberInfo.getGender());
	        dto.setBirth(memberInfo.getBirth());
	        dto.setPoint(memberInfo.getPoint());
	        dto.setTrustScore(memberInfo.getTrustScore());	// 신고... 매너점수(신뢰도점수) & 뱃지
	    }
	    
	    // 회원 관심사
	    List<MemberInterest> memberInterests = memberInterestRepository.findByMember_Id(memberId);

	    List<Integer> interestIds = memberInterests.stream()
	            .map(memberInterest -> memberInterest.getInterest().getInterestId().intValue() ) .toList();

	    dto.setInterestIds(interestIds);
		
		return dto;
	}
	
	// 회원정보 수정
	@Transactional
	@Override
	public UserDto updateMember(Long memberId, UserDto dto) {

	    // 1. 회원 조회
	    Member member = memberRepository.findById(memberId)
	            .orElseThrow(() -> new IllegalArgumentException( "존재하지 않는 회원입니다." )
	            );

	    // =====================================================
	    // 2. 회원 기본정보 수정
	    // =====================================================

	    // 닉네임
	    if (dto.getNickname() != null && !dto.getNickname().isBlank()) {

	        member.setNickname(dto.getNickname());
	    }

	    // 전화번호
	    if (dto.getMobile() != null && !dto.getMobile().isBlank()) {

	        member.setMobile(dto.getMobile());
	    }

	    // 프로필 이미지
	    if (dto.getProfileUrl() != null && !dto.getProfileUrl().isBlank()) {
	        member.setProfileUrl(dto.getProfileUrl());
	    }


	    // =====================================================
	    // 3. 회원 상세정보 조회
	    // =====================================================

	    MemberInfo memberInfo = memberInfoRepository.findById(memberId)
	                    .orElseThrow(() -> new IllegalArgumentException( "회원 상세정보가 존재하지 않습니다." ) );


	    // =====================================================
	    // 4. 성별 수정
	    // =====================================================

	    if (dto.getGender() != null) {  memberInfo.setGender(dto.getGender()); }


	    // =====================================================
	    // 5. 생년월일 수정
	    // =====================================================

	    if (dto.getBirth() != null) {  memberInfo.setBirth(dto.getBirth()); }


	    // =====================================================
	    // 6. 관심사 수정
	    // =====================================================

	    // null이면 관심사를 수정하지 않음
	    if (dto.getInterestIds() != null) {

	        // 기존 관심사 삭제
	        memberInterestRepository.deleteByMember_Id(memberId);

	        // 새로운 관심사 저장
	        for (Integer interestId : dto.getInterestIds()) {

	            Interest interest = interestRepository.findById( interestId.longValue() )
	                    .orElseThrow(() -> new IllegalArgumentException( "존재하지 않는 관심사입니다." ) );

	            MemberInterest memberInterest = new MemberInterest();

	            MemberInterestId id = new MemberInterestId( memberId, interest.getInterestId() );

	            memberInterest.setId(id);
	            memberInterest.setMember(member);
	            memberInterest.setInterest(interest);

	            memberInterestRepository.save(memberInterest);
	        }
	    }


	    // =====================================================
	    // 7. 수정된 회원정보 DTO 생성
	    // =====================================================

	    UserDto result = new UserDto();

	    result.setMemberId(member.getId());
	    result.setLoginId(member.getLoginId());
	    result.setEmail(member.getEmail());
	    result.setNickname(member.getNickname());
	    result.setMobile(member.getMobile());
	    result.setProfileUrl(member.getProfileUrl());
	    result.setMemberTypeId( member.getMemberType().getMemberTypeId() );
	    result.setStatusId( member.getMemberStatus().getStatusId() );


	    // 회원 상세정보
	    result.setGender(memberInfo.getGender());
	    result.setBirth(memberInfo.getBirth());
	    result.setPoint(memberInfo.getPoint());

	    // 관심사
	    List<MemberInterest> memberInterests = memberInterestRepository.findByMember_Id(memberId);

	    List<Integer> interestIds = memberInterests.stream()
	                    .map(memberInterest -> memberInterest.getInterest().getInterestId().intValue() ).toList();

	    result.setInterestIds(interestIds);

	    return result;
	}
	
	// 회원탈퇴(논리삭제)
	@Transactional
	@Override
	public void deleteMember(Long memberId) {
		//1. 회원조회
		Member member = memberRepository.findByIdAndDeleteYn(memberId, 'N')
							.orElseThrow(()->new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		//2. delete 상태 조회
		MemberStatus deletedStatus = memberStatusRepository.findById(4L)
										.orElseThrow(()->new IllegalArgumentException("삭제 상태가 존재하지 않습니다."));
		
		//3. 상태변경
		member.setMemberStatus(deletedStatus);
		
		member.setDeleteYn('Y');
	}
	
	@Transactional
	@Override
	public UserDto socialSignup(UserDto dto) {		

	    // 1. 이메일 중복 확인
		
		// 이미 가입된 이메일인지 확인
		if(memberRepository.existsByEmail(dto.getEmail())){
			throw new IllegalArgumentException("이미 가입된 이메일입니다.");
		}		
		
		// 회원유형 조회
		MemberType memberType = memberTypeRepository.findById(1L)
									.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원 유형입니다."));		
		
		
		// 일반회원 상태 조회
		MemberStatus memberStatus = memberStatusRepository.findById(1L)
										.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원 상태입니다."));
		
		
		// 신고 상태 조회
	    MemberReportStatus reportStatus =
	            memberReportStatusRepository.findById(1L)
	            .orElseThrow(() ->
	                new IllegalArgumentException("신고 상태가 존재하지 않습니다.")
	            );
		
		// 회원 생성
		Member member = new Member();		
		String socialLoginId = dto.getProvider() + "_" + dto.getProviderId();

		member.setLoginId(socialLoginId);
		member.setEmail(dto.getEmail());
		member.setNickname(dto.getNickname());
		member.setMobile(dto.getMobile());
		member.setProvider(dto.getProvider());
		member.setProviderId(dto.getProviderId());
		
		member.setPassword(passwordEncoder.encode( dto.getProvider() + "_" + dto.getProviderId() ));
		
		// 프로필 이미지
		if(dto.getProfileUrl() == null || dto.getProfileUrl().isBlank()) {
			member.setProfileUrl("/images/moit.png");
		}else {
			member.setProfileUrl(dto.getProfileUrl());
		}
		
		member.setMemberType(memberType);
		member.setMemberStatus(memberStatus);		
	    
		memberRepository.save(member);
		
		
		// 회원 상세정보 저장
		MemberInfo memberInfo = new MemberInfo();
		
		memberInfo.setMember(member);
		memberInfo.setGender(dto.getGender());
		memberInfo.setBirth(dto.getBirth());
		
		memberInfo.setMemberReportStatus(reportStatus);
		
		memberInfoRepository.save(memberInfo);
		
		// 회원 관심사 저장
		if(dto.getInterestIds() != null) {
			for(Integer interestId : dto.getInterestIds()) {			
				
				Interest interest = interestRepository.findById(interestId.longValue())
						.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 관심사입니다."));
				
				MemberInterest memberInterest = new MemberInterest();
				
				MemberInterestId id = new MemberInterestId(member.getId(), interest.getInterestId());
				
				memberInterest.setId(id);
				memberInterest.setMember(member);
				memberInterest.setInterest(interest);
				
				memberInterestRepository.save(memberInterest);				
			}
		}
		
		// DTO에 반영
		
		dto.setMemberId(member.getId());
		dto.setLoginId(member.getLoginId());
		dto.setMemberTypeId(member.getMemberType().getMemberTypeId());
		dto.setStatusId(member.getMemberStatus().getStatusId());
		dto.setProfileUrl(member.getProfileUrl());
		
		
		return dto;
	}
	
	@Override
	public List<UserDto> findAllMembers() {
		
		List<Member> members = memberRepository.findAll();
		
		return members.stream().map(member->{
			UserDto dto = new UserDto();
			
			dto.setMemberId(member.getId());
			dto.setLoginId(member.getLoginId());
			dto.setEmail(member.getEmail());
			dto.setNickname(member.getNickname());
			dto.setMobile(member.getMobile());
			dto.setProfileUrl(member.getProfileUrl());
			dto.setMemberTypeId(member.getMemberType().getMemberTypeId());
			dto.setStatusId(member.getMemberStatus().getStatusId());
			dto.setProvider(member.getProvider());
			dto.setProviderId(member.getProviderId());
			
			return dto;
		}).toList();
	}
	
	// 마이페이지 조회
	@Override
	public MyPageDto getMyPage(Long memberId) {
		
		// 회원조회
		Member member = memberRepository.findById(memberId)
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		// 상세정보 조회
		MemberInfo memberInfo = memberInfoRepository.findById(memberId)
									.orElse(null);
		
		// 마이페이지 DTO 생성
		MyPageDto dto = new MyPageDto();
		
		dto.setMemberId(member.getId().intValue());
		dto.setLoginId(member.getLoginId());
		dto.setNickname(member.getNickname());
		dto.setEmail(member.getEmail());
		dto.setMobile(member.getMobile());
		dto.setProfileUrl(member.getProfileUrl());
		dto.setProvider(member.getProvider());	
		dto.setMemberTypeId(member.getMemberType().getMemberTypeId());
		
		if (member.getCreatedAt() != null) {
		    dto.setCreatedAt( member.getCreatedAt().toLocalDate().toString() );
		}
		
		// 회원 상세정보
		if(memberInfo != null) {
			dto.setPoint(memberInfo.getPoint());
			dto.setTrustScore(memberInfo.getTrustScore());
			dto.setBirth(memberInfo.getBirth());
			dto.setGender(memberInfo.getGender());
		}
		
		// 회원 관심사 조회
		List<MemberInterest> memberInterests = memberInterestRepository.findByMember_Id(memberId);
		
		// 관심사 id + 이름 반환
		List<MyPageDto.InterestDto> interests = memberInterests.stream()
													.map(memberInterest -> new MyPageDto.InterestDto(memberInterest.getInterest().getInterestId(),
																									 memberInterest.getInterest().getInterestName())).toList();
		
		// dto에 관심사 저장
		dto.setInterests(interests);
		
		return dto;
	}
	@Override
	public String findLoginIdByEmail(String email) {
		
		if (!verificationService.isEmailVerified(email)) {
	        throw new IllegalArgumentException( "이메일 인증이 완료되지 않았습니다." );
	    }
		
		Member member = memberRepository.findByEmail(email)
							.orElseThrow(()-> new IllegalArgumentException("해당 이메일로 가입된 회원이 없습니다."));
		
		return member.getLoginId();
	}
	
	@Transactional
	@Override
	public void resetPassword(String email, String password) {
		Member member = memberRepository.findByEmailAndDeleteYn(email, 'N')
							.orElseThrow(()-> new IllegalArgumentException("해당 이메일로 가입된 회원이 없습니다."));
		
		// 기존 비밀번호와 동일한지 확인
	    if (passwordEncoder.matches(password, member.getPassword())) {
	        throw new IllegalArgumentException( "이미 사용했던 비밀번호로 변경은 어렵습니다." );
	    }
		
		member.setPassword(passwordEncoder.encode(password));
	}
	
	@Transactional
	@Override
	public void changePassword(Long memberId, String currentPassword, String newPassword) {
		
		Member member = memberRepository.findById(memberId)
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		// 현재 비밀번호 확인
		if(!passwordEncoder.matches(currentPassword, member.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
		}
		
		// 기존 비밀번호와 동일한지 확인
		if(passwordEncoder.matches(newPassword, member.getPassword())) {
			throw new IllegalArgumentException("이미 사용했던 비밀번호로 변경은 어렵습니다.");
		}
		
		// 비밀번호 유출검사
		int leakCount = passwordLeakService.getLeakCount(newPassword);
		
		if(leakCount>0) {
			throw new IllegalArgumentException("유출된 비밀번호는 사용할 수 없습니다.");
		}
		
		if(leakCount == -1) {
			throw new IllegalArgumentException("비밀번호 보안 검증에 실패했습니다.");
		}
		
		// 새 비밀번호 암호화
		member.setPassword(passwordEncoder.encode(newPassword));
		
	}
	
	@Transactional
	@Override
	public void updateProfileImage(Long memberId, String profileUrl) {
		
		Member member = memberRepository.findById(memberId)
							.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		member.setProfileUrl(profileUrl);
		
	}
	
	
	
}

package com.moit.member.oauth2;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.dto.UserDto;
import com.moit.member.entity.Member;
import com.moit.member.repository.MemberRepository;
import com.moit.security.CustomUserDetails;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Oauth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final HttpSession session;
    private final HttpServletRequest request;

    @Transactional(readOnly = true)
    @Override
    public OAuth2User loadUser(
            OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {
    	
    	// deviceId 저장
    	String deviceId = request.getParameter("deviceId");

    	if (deviceId != null && !deviceId.isBlank()) {
    	    session.setAttribute("deviceId", deviceId);
    	}

        // 1. OAuth2 사용자 정보 조회
        OAuth2User oAuth2User = super.loadUser(userRequest);        

        // 2. provider 확인
        String provider = userRequest .getClientRegistration() .getRegistrationId();

        // 3. provider별 사용자 정보 변환
        UserInfoOAuth2 info;

        if ("google".equals(provider)) {  
        	info = new UserGoogle( oAuth2User.getAttributes() );
        } 
        else if ("naver".equals(provider)) {

            info = new UserNaver( oAuth2User.getAttributes() );
        } 
        else if ("kakao".equals(provider)) {
            info = new UserKakao( oAuth2User.getAttributes() );
        } 
        else {
            throw new OAuth2AuthenticationException( "지원하지 않는 소셜 로그인입니다. : " + provider );
        }

        // 4. OAuth 정보 추출
        String email = info.getEmail();
        String nickname = info.getNickname();
        String providerId = info.getProviderId();
        String profileUrl = info.getImage();

        // 5. provider + providerId로 회원 조회
        Member member = memberRepository.findByProviderAndProviderId( provider, providerId ) 
        					.orElse(null);

        // 신규 소셜 회원
        if (member == null) {
            UserDto socialUser = new UserDto();
            
            socialUser.setLoginId(provider + "_" + providerId);
            socialUser.setEmail(email);
            socialUser.setNickname(nickname);
            socialUser.setProvider(provider);
            socialUser.setProviderId(providerId);
            socialUser.setProfileUrl(profileUrl);

            // 회원가입 전 임시 저장
            session.setAttribute( "socialUser", socialUser );

            // 임시 인증 객체
            UserDto tempUser = new UserDto();

            tempUser.setMemberId(0L);
            tempUser.setLoginId( provider + "_" + providerId );
            tempUser.setEmail(email);
            tempUser.setNickname(nickname);
            tempUser.setProvider(provider);
            tempUser.setProviderId(providerId);
            tempUser.setProfileUrl(profileUrl);

            Map<String, Object> attributes = createAttributes(
                            provider, providerId, email, nickname, profileUrl
                    );
            return new CustomUserDetails( tempUser, attributes );
        }

        // 기존 소셜 회원
        UserDto user = new UserDto();

        user.setMemberId(member.getId());
        user.setLoginId(member.getLoginId());
        user.setEmail(member.getEmail());
        user.setNickname(member.getNickname());
        user.setMobile(member.getMobile());
        user.setProfileUrl(member.getProfileUrl());

        user.setProvider(member.getProvider());
        user.setProviderId(member.getProviderId());

        user.setMemberTypeId( member.getMemberType() .getMemberTypeId() );

        user.setStatusId( member.getMemberStatus() .getStatusId() );

        Map<String, Object> attributes = createAttributes(
                        provider, providerId, email, nickname, profileUrl
                );

        return new CustomUserDetails(
                user, attributes
        );
    }

    private Map<String, Object> createAttributes(
            String provider, String providerId, String email, String nickname, String profileUrl) {

        Map<String, Object> attributes = new HashMap<>();

        attributes.put("provider", provider);
        attributes.put("providerId", providerId);
        attributes.put("email", email);
        attributes.put("nickname", nickname);
        attributes.put( "profileUrl", profileUrl == null ? "" : profileUrl );

        return attributes;
    }
}
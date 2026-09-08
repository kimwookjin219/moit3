package com.moit.security;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.moit.member.dto.AuthUserDto;
import com.moit.member.dto.UserDto;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails , OAuth2User{ //1.  UserDetails (security)

	private static final long serialVersionUID = 1L;

	private UserDto user;
	private AuthUserDto authDto;
	private Map<String,Object> attributes = new HashMap<>(); //##

	private Long statusId;
	private String deviceId;

	////////////////////////////////////// 1. 일반 로그인
	public CustomUserDetails(UserDto user, AuthUserDto authDto) {
		super();
		this.user = user;
		this.authDto = authDto;
		this.attributes.put("loginId", user.getLoginId());
		this.attributes.put("provider", user.getProvider());
		if(authDto != null){ this.statusId = authDto.getStatusId(); }
	} 
	
	@Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
		
		// 소셜 로그인 대기
		if(Long.valueOf(0L).equals(user.getMemberId())){
	        return List.of( new SimpleGrantedAuthority("ROLE_SOCIAL") );
	    }
		// JPA 로그인
       if (authDto == null) {
    	   if (user.getMemberTypeId() == null) {
               return List.of( new SimpleGrantedAuthority("ROLE_MEMBER") );
           }

           switch (user.getMemberTypeId().intValue()) {
               case 1: return List.of( new SimpleGrantedAuthority("ROLE_MEMBER") );
               case 2: return List.of( new SimpleGrantedAuthority("ROLE_PARTNER") );
               case 3: return List.of( new SimpleGrantedAuthority("ROLE_ADMIN") );
               case 4: return List.of( new SimpleGrantedAuthority("ROLE_SUPERADMIN") );
               default: return List.of( new SimpleGrantedAuthority("ROLE_MEMBER") );
           }
       }
       
       // 기존 MyBatis 로그인
       if (authDto.getTypeName() == null) {
           return List.of( new SimpleGrantedAuthority("ROLE_MEMBER") );
       }

       return List.of( new SimpleGrantedAuthority(authDto.getTypeName()) );
	}	

	public Long   getAppUserId() { return user.getMemberId(); }
	public String  getEmail()     { return user.getEmail(); }
	public String  getProvider()  { return user.getProvider(); }
	public String getProviderId() { return user.getProviderId(); }
	public String getProfileUrl(){ return user.getProfileUrl(); }
	
	public String getNickname() { return user.getNickname(); }
	public String getTypeName() { 
		if(authDto != null) { return authDto.getTypeName(); }
		return "ROLE_MEMBER"; 
    }
	public Long getStatusId(){ return statusId; }
    // ★ 중요
    @Override public String getPassword() { 
    	
    	if(authDto != null) { return authDto.getPassword(); }
    	
    	return user.getPassword();  //### 
    	}



    // ★ 중요
    @Override public String getUsername() {  return user.getLoginId();  }

		
	//////////////////////////////////////////////////////////////////////////// social
	// java : alt + shift + s
	public CustomUserDetails(UserDto user, Map<String, Object> attirubutes) {
		super();
		this.user = user;
		//this.authDto = new AuthUserDto();
		this.attributes = new HashMap<>(attirubutes != null? attirubutes : Map.of()) ;
		this.attributes.put("loginId", user.getLoginId());
		this.attributes.put("provider", user.getProvider());		
		this.statusId = user.getStatusId();
	}
	
	public boolean isSocialPending() {
	    return Long.valueOf(0L).equals(user.getMemberId());
	}
	
	@Override public Map<String, Object> getAttributes() { return attributes; }
	          public void setAttributes(Map<String, Object> attributes ) { this.attributes = attributes; }
	
	@Override public String getName() { return user.getProviderId() ; }
	
	
	// JPA 일반 로그인용
	public CustomUserDetails(UserDto user) {
	    this.user = user;

	    this.attributes.put("loginId", user.getLoginId());
	    this.attributes.put("provider", user.getProvider());

	    this.statusId = user.getStatusId();
	}
	
	public CustomUserDetails(UserDto user, String deviceId) {
	    this.user = user;

	    this.attributes.put("loginId", user.getLoginId());
	    this.attributes.put("provider", user.getProvider());

	    this.statusId = user.getStatusId();
	    this.deviceId = deviceId;
	}
	
	public String getDeviceId() { return deviceId; }
	
	
}







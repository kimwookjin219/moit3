package com.moit.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {
	
	@Autowired private CustomUserDetailsService userDetailsService;
	@Autowired private HttpServletRequest request;
	
	@Autowired
	@Qualifier("passwordEncoder")
	private PasswordEncoder pwencoder;

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		
		String loginId = authentication.getName();
		String password = authentication.getCredentials().toString();
		
		CustomUserDetails user = (CustomUserDetails) userDetailsService.loadUserByUsername(loginId);
		
		String loginType = request.getParameter("memberTypeId");
		
		if(loginType != null) {
		    if(!Integer.valueOf(loginType)
		            .equals(user.getUser().getMemberTypeId())) {
		        throw new BadCredentialsException( "TYPE" );
		    }
		}
		
		if(!pwencoder.matches(password, user.getPassword())) {
			throw new BadCredentialsException("비밀번호 오류");
		}
		
		if(user.getUser().getMemberTypeId() == 3 && user.getUser().getStatusId() == 2) {
			throw new DisabledException("승인대기");
		}
		
		return new UsernamePasswordAuthenticationToken(user, password,user.getAuthorities());
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
	}
	
	

}

package com.moit.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.moit.member.dto.UserDto;
import com.moit.member.service.MemberService;

import lombok.RequiredArgsConstructor;


@Service //##
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{

	private final MemberService service;  
   
   @Override
   public UserDetails loadUserByUsername(String username)
           throws UsernameNotFoundException {


       UserDto user = service.findByLoginId(username);

       if(user == null){
           throw new UsernameNotFoundException( "사용자를 찾을 수 없습니다 : " + username );
       }
      
       if(user.getStatusId() == 2L) {
           throw new BadCredentialsException("WAIT");
       }         
              
       return new CustomUserDetails(user);
	}
}

package com.moit.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomLoginFailureHandler implements AuthenticationFailureHandler {

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		
		String message = exception.getMessage();

		if("WAIT".equals(message)) {
		    response.sendRedirect("/user/member/login?error=wait");
		}
		else if("TYPE".equals(message)) {
		    response.sendRedirect("/user/member/login?error=type");
		}else{
		    response.sendRedirect("/user/member/login?error=fail");
		}
		
	}

}

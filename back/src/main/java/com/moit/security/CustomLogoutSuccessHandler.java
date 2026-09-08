package com.moit.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

	@Value("${app.oauth2.kakao-client-id}")
	private String kakaoClientId;

	@Value("${app.oauth2.kakao-logout-redirect-url}")
	private String kakaoLogoutRedirectUrl;
	
    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication)
            throws IOException, ServletException {

        if (authentication != null &&
            authentication.getPrincipal() instanceof CustomUserDetails user) {

            String provider = user.getProvider();

            if ("kakao".equals(provider)) {

                String logoutUrl =
                    "https://kauth.kakao.com/oauth/logout"
                    + "?client_id=" + kakaoClientId
                    + "&logout_redirect_uri=" + kakaoLogoutRedirectUrl;

                response.sendRedirect(logoutUrl);
                return;
            }
        }
        response.sendRedirect("/user/member/login");
    }
}
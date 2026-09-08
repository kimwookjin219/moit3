package com.moit.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.moit.member.oauth2.Oauth2UserService;
import com.moit.security.CustomLoginFailureHandler;
import com.moit.security.CustomLogoutSuccessHandler;
import com.moit.security.JwtAuthenticationFilter;
import com.moit.security.SocialLoginSuccessHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final Oauth2UserService oauthUserService;
    private final SocialLoginSuccessHandler socialLoginSuccessHandler;
    private final CustomLoginFailureHandler customLoginFailureHandler;
    private final CustomLogoutSuccessHandler customLogoutSuccessHandler;

    // JWT
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // =========================================================
    // Security Filter Chain
    // =========================================================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // =====================================================
        // 1. CORS
        // =====================================================
        http.cors(cors ->
            cors.configurationSource(corsConfigurationSource())
        );

        // =====================================================
        // 2. CSRF
        // =====================================================
        http.csrf(csrf -> csrf
            .ignoringRequestMatchers(
                "/user/member/join",
                "/user/member/update",
                "/user/member/delete",
                "/questions/deleteSelected",
                "/api/meetups/**",
                "/api/members/**",
                "/api/questions/**",
                "/api/notifications/**",
                "/api/reports/**",
                "/api/reports",
                "/api/admin/advertisement/**",
                "/api/advertisement/**",
                "/api/reviews/**",
                "/api/admin/**",
                "/api/payment/**",
                "/user/advertisement/aiAdvertise",
                "/api/common/**"              

            )
        );

        // =====================================================
        // 3. JWT 인증 필터
        // =====================================================
        http.addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );

        // =====================================================
        // 4. 접근 권한
        // =====================================================
        http.authorizeHttpRequests(auth -> auth

            // -------------------------------------------------
            // CORS Preflight
            // -------------------------------------------------
            .requestMatchers(HttpMethod.OPTIONS, "/**")
            .permitAll()

            // -------------------------------------------------
            // API 공개 영역
            // -------------------------------------------------
            .requestMatchers(
                "/api/members/signup",
                "/api/members/login",
                "/api/members/check-loginId",
                "/api/members/check-email",
                "/api/members/check-nickname",
                "/api/members/phone/send",
                "/api/members/phone/verify",
                "/api/members/refresh",
                "/api/members/email/send",
                "/api/members/email/verify",
                "/api/members/check-password",
                "/api/members/social-info",
                "/api/members/find-id",
                "/api/members/reset-password",
                "/api/members/signup/behavior/analyze"
            ).permitAll()

            // -------------------------------------------------
            // 일반 페이지 공개 영역
            // -------------------------------------------------
            .requestMatchers(
                "/user/member/join",
                "/user/member/login",
                "/user/checkLoginId",
                "/user/checkNickname",
                "/user/member/checkPassword",
                "/admin/member/join",
                "/meetup/list",
                "/user/advertisement/click",
                "/user/member/kakaologout",
                "/upload/**",
                "/images/**",
                
                //운영환경에서는 yml로 제어 
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**"

            ).permitAll()
            
			// -------------------------------------------------
			// 모집글 공개/비공개 변경 → 관리자만 20260830 bora추가
			// -------------------------------------------------
			.requestMatchers(
			    HttpMethod.PATCH,
			    "/api/meetups/*/visibility"
			)
			.hasAnyRole("ADMIN", "SUPERADMIN")
			
			// -------------------------------------------------
			// 모집글 조회 → 공개 20260830 bora추가
			// -------------------------------------------------
			.requestMatchers(
			    HttpMethod.GET,
			    "/api/meetups/**"
			)
			.permitAll()
			
            // -------------------------------------------------
            // 회원 API
            // -------------------------------------------------
            .requestMatchers(
            		"/api/members/**",
            		"/api/common/**"
            )
            .authenticated()

            // -------------------------------------------------
            // 회원 페이지
            // -------------------------------------------------
            .requestMatchers(
                "/user/member/mypage",
                "/user/member/update",
                "/user/member/delete",
                "/user/advertisement/**",
                "/meetup/write/**",
                "/meetup/detail/**",
                "/mypage/**",
                "/api/questions/**"
            ).authenticated()

            // -------------------------------------------------
            // 제휴업체 광고

            // -------------------------------------------------
            // 20260830 bora추가
            .requestMatchers(
                    "/api/advertisement/top",
                    "/api/advertisement/click",
                    "/api/advertisement/impression"
                    
            	)
            .permitAll()
            
            // -------------------------------------------------    
            .requestMatchers(
            		"/api/advertisement/prices",
            	    "/api/advertisement/*/extension-prices",
            	    "/api/advertisement/**" 
            )
            .hasRole("PARTNER")


            // -------------------------------------------------
            // 관리자
            // -------------------------------------------------
             .requestMatchers("/api/admin/**", "/api/reports/admin/**")
             .hasAnyRole("ADMIN", "SUPERADMIN")


            // -------------------------------------------------
            // 나머지
            // -------------------------------------------------
            .anyRequest()
            .authenticated() // 20260830 bora수정
        );

        // =====================================================
        // 5. Form Login
        // =====================================================
        http.formLogin(form -> form
            .loginPage("/user/member/login")
            .loginProcessingUrl("/login")
            .defaultSuccessUrl("/user/main", false)
            .failureHandler(customLoginFailureHandler)
            .permitAll()
            .authenticationDetailsSource(
                new CustomAuthenticationDetailsSource()
            )
        );

        // =====================================================
        // 6. Logout
        // =====================================================
        http.logout(logout -> logout
            .logoutUrl("/user/member/logout")
            .logoutSuccessHandler(customLogoutSuccessHandler)
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .deleteCookies("JSESSIONID")
            .permitAll()
        );

        // =====================================================
        // 7. OAuth2 Login
        // =====================================================
        http.oauth2Login(oauth2 -> oauth2
            .loginPage("/user/member/login")
            .successHandler(socialLoginSuccessHandler)
            .userInfoEndpoint(userinfo ->
                userinfo.userService(oauthUserService)
            )
        );

        // =====================================================
        // 8. API 인증 실패 처리
        // =====================================================
        http.exceptionHandling(exception -> exception
            .defaultAuthenticationEntryPointFor(
                (request, response, authException) -> {

                    response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "JWT 인증이 필요합니다."
                    );
                },
                request ->
                    request.getRequestURI().startsWith("/api/")
            )
        );

        return http.build();
    }

    // =========================================================
    // CORS 설정
    // =========================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();

        // Next.js
        configuration.setAllowedOrigins(
            List.of("http://localhost:3000","http://43.201.106.124")
        );

        // 허용 HTTP Method
        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
            )
        );

        // 허용 Header
        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Device-Id"
            )
        );

        // Cookie / Credential 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }

    // =========================================================
    // AuthenticationManager
    // =========================================================
    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }

    // =========================================================
    // Custom Authentication Details
    // =========================================================
    private static class CustomAuthenticationDetailsSource
        implements org.springframework.security.authentication.AuthenticationDetailsSource<
            HttpServletRequest,
            WebAuthenticationDetails> {

        @Override
        public WebAuthenticationDetails buildDetails(
            HttpServletRequest context
        ) {

            return new WebAuthenticationDetails(context) {

                public String getMemberTypeId() {
                    return context.getParameter("memberTypeId");
                }
            };
        }
    }
}
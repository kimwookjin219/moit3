package com.moit.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.moit.member.dto.UserDto;
import com.moit.member.service.LoginDeviceService;
import com.moit.member.service.MemberService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService service;
    private final LoginDeviceService loginDeviceService;

    public JwtAuthenticationFilter( 
    		JwtTokenProvider jwtTokenProvider, 
    		MemberService memberService, 
    		LoginDeviceService loginDeviceService ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.service = memberService;
        this.loginDeviceService = loginDeviceService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        // =====================================================
        // 0. CORS Preflight 요청
        // =====================================================
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 1. Authorization Header 확인
        // =====================================================
        String authorization = request.getHeader("Authorization");


        // =====================================================
        // 2. JWT가 없는 경우
        // =====================================================
        if (
            authorization == null ||
            !authorization.startsWith("Bearer ")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 3. Bearer 제거
        // =====================================================
        String token = authorization.substring(7);

        // =====================================================
        // 4. JWT 검증
        // =====================================================
        boolean valid =
            jwtTokenProvider.validateToken(token);


        if (valid) {

            // =================================================
            // 5. JWT 타입 확인
            // =================================================
            String tokenType =
                jwtTokenProvider.getTokenType(token);


            // Refresh Token은 API 인증에 사용할 수 없음
            if (!"ACCESS".equals(tokenType)) {


                filterChain.doFilter(request, response);
                return;
            }

            // =================================================
            // 6. JWT에서 회원 ID 가져오기
            // =================================================
            Long memberId =
                jwtTokenProvider.getMemberId(token);
            
            String deviceId =
            	    jwtTokenProvider.getDeviceId(token);
            
            boolean deviceValid =
            	    loginDeviceService.existsLoginDevice(memberId, deviceId);
            
            if (!deviceValid) {

            	// Refresh Token Cookie 삭제
                jakarta.servlet.http.Cookie refreshCookie =
                    new jakarta.servlet.http.Cookie("refreshToken", "");

                refreshCookie.setHttpOnly(true);
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(0);

                response.addCookie(refreshCookie);

                // JSESSIONID 삭제
                jakarta.servlet.http.Cookie sessionCookie =
                    new jakarta.servlet.http.Cookie("JSESSIONID", "");

                sessionCookie.setHttpOnly(true);
                sessionCookie.setPath("/");
                sessionCookie.setMaxAge(0);

                response.addCookie(sessionCookie);

                // 인증 실패
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // =================================================
            // 7. DB에서 회원 조회
            // =================================================
            UserDto user =
                service.findByMemberId(memberId);

            // =================================================
            // 8. 회원 존재 여부
            // =================================================
            if (user != null) {

                // ---------------------------------------------
                // 탈퇴 / 정지 회원 차단
                // ---------------------------------------------
                if (
                    user.getStatusId() == null ||
                    !user.getStatusId().equals(1L)
                ) {

                    filterChain.doFilter(request, response);
                    return;
                }

                // ---------------------------------------------
                // CustomUserDetails 생성
                // ---------------------------------------------
                CustomUserDetails userDetails =
                    new CustomUserDetails(user, deviceId);

                // ---------------------------------------------
                // Authentication 생성
                // ---------------------------------------------
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );

                authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                        .buildDetails(request)
                );

                // ---------------------------------------------
                // SecurityContext 저장
                // ---------------------------------------------
                SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            } else {

                System.out.println(
                    "회원 조회 실패"
                );
            }
        }

        // =====================================================
        // 9. 다음 Filter
        // =====================================================
        filterChain.doFilter(request, response);
    }
}
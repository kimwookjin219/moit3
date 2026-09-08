package com.moit.member.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.member.entity.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>{
	
	// 로그인 아이디로 조회
	Optional<Member> findByLoginIdAndDeleteYn(String loginId, Character deleteYn);
	
	Optional<Member> findByEmail(String email);
	
	Optional<Member> findByNickname(String nickname);
	
	Optional<Member> findByEmailAndDeleteYn(String email, Character deleteYn);
	
	Optional<Member> findByIdAndDeleteYn(Long id, Character deleteYn);
	
	// 소셜 조회용
	Optional<Member> findByProviderAndProviderId(String provider, String providerId);
	
	// 아이디 중복검사
	boolean  existsByLoginId(String loginId);
	
	// 이메일 중복검사
	boolean  existsByEmail(String email);
	
	// 닉네임 중복검사
	boolean  existsByNickname(String nickname);	
	
    // 관리자 회원관리
    @Query("""
        SELECT m
        FROM Member m
        WHERE m.deleteYn = :deleteYn
        AND (
            :memberTypeId IS NULL
            OR m.memberType.id = :memberTypeId
        )
        AND (
            :keyword IS NULL
            OR :keyword = ''
            OR LOWER(m.loginId) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(m.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        ORDER BY m.id DESC
    """)
    Page<Member> findAdminMembers(
        @Param("memberTypeId") Long memberTypeId,
        @Param("deleteYn") Character deleteYn,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
    // 전체 회원 수
    long countByDeleteYn(Character deleteYn);

    // 관리자 / 최고관리자
    long countByMemberType_MemberTypeIdAndDeleteYn( Long memberTypeId, Character deleteYn );

    // 정지 회원
    long countByMemberStatus_StatusIdAndDeleteYn( Long statusId, Character deleteYn );
	
    // 오늘 가입자 수
    @Query(
    	    value = """
    	        SELECT COUNT(*)
    	        FROM members
    	        WHERE created_at >= TRUNC(SYSDATE)
    	          AND created_at < TRUNC(SYSDATE) + 1
    	        """,
    	    nativeQuery = true
    	)
    	long countTodayMembers();
}

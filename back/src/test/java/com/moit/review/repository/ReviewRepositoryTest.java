package com.moit.review.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.annotation.Rollback; // ★ 추가
import org.springframework.test.context.TestPropertySource;

import com.moit.meetup.entity.Meetup;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.review.entity.Review;
import com.moit.review.entity.ReviewLike;

@DataJpaTest
@EnableJpaRepositories(basePackages = "com.moit.review")
@EntityScan(basePackages = "com.moit")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Rollback(false) // ★ 1. 테스트 실행 완료 후 트랜잭션을 롤백하지 않고 DB에 COMMIT
@TestPropertySource(properties = {
    "spring.jpa.database-platform=org.hibernate.dialect.OracleDialect",
    "spring.jpa.hibernate.ddl-auto=update", // ★ 2. create-drop 대신 update로 변경해 테스트 종료 후 테이블 삭제 방지
    "spring.jpa.generate-ddl=true"
})
public class ReviewRepositoryTest {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    @Autowired
    private TestEntityManager em;

    private Member testMember;
    private Meetup testMeetup;

    @BeforeEach
    void setUp() {
        // ★ 3. DB에 기존 PK(1L) 데이터가 존재하면 가져오고, 없을 때만 생성하여 ORA-00001(PK 중복) 방지
        MemberType memberType = em.find(MemberType.class, 1L);
        if (memberType == null) {
            memberType = new MemberType();
            memberType.setMemberTypeId(1L);
            memberType.setTypeName("ROLE_USER");
            em.persist(memberType);
        }

        MemberStatus memberStatus = em.find(MemberStatus.class, 1L);
        if (memberStatus == null) {
            memberStatus = new MemberStatus();
            memberStatus.setStatusId(1L);
            memberStatus.setStatusName("ACTIVE");
            em.persist(memberStatus);
        }

        // ★ 4. Unique 컬럼(loginId, email 등) 충돌 방지를 위해 실행 시마다 고유한 값 생성
        String uniqueId = String.valueOf(System.currentTimeMillis());
        testMember = new Member();
        testMember.setLoginId("user_" + uniqueId);
        testMember.setNickname("테스터_" + uniqueId);
        testMember.setEmail("test_" + uniqueId + "@moit.com");
        testMember.setPassword("password123!");
        testMember.setMemberType(memberType);
        testMember.setMemberStatus(memberStatus);
        em.persist(testMember);

        // Meetup 필수 필드 세팅
        testMeetup = new Meetup();
        testMeetup.setMember(testMember);
        testMeetup.setMeetupStatus(com.moit.meetup.enums.MeetupStatus.values()[0]); 
        em.persist(testMeetup);

        em.flush();
    }

    @Test
    @DisplayName("[JPA 매핑 검증] Review 엔티티 저장 및 연관관계 조회")
    void reviewMappingTest() {
        // given
        Review review = new Review();
        review.setMeetup(testMeetup);
        review.setMember(testMember);
        review.setContent("JPA 연관관계 매핑 테스트 내용입니다.");
        review.setRating(5);
        review.setLikesCount(0);
        review.setViewsCount(0);
        review.setIsPublic("Y");

        // when
        Review savedReview = reviewRepository.save(review);
        em.flush();
        em.clear(); // 영속성 컨텍스트 초기화 -> 실제 DB SELECT 쿼리로 조회 검증

        // then
        Review foundReview = reviewRepository.findById(savedReview.getId()).orElse(null);
        assertThat(foundReview).isNotNull();
        assertThat(foundReview.getContent()).isEqualTo("JPA 연관관계 매핑 테스트 내용입니다.");
        assertThat(foundReview.getMeetup().getId()).isEqualTo(testMeetup.getId());
        assertThat(foundReview.getMember().getId()).isEqualTo(testMember.getId());
    }

    @Test
    @DisplayName("[JPA 매핑 검증] ReviewLike 엔티티 저장 및 매핑 검증")
    void reviewLikeMappingTest() {
        // given
        Review review = new Review();
        review.setMeetup(testMeetup);
        review.setMember(testMember);
        review.setContent("좋아요 테스트용 리뷰");
        Review savedReview = reviewRepository.save(review);

        ReviewLike reviewLike = new ReviewLike();
        reviewLike.setReview(savedReview);
        reviewLike.setMember(testMember);
        reviewLikeRepository.save(reviewLike);

        em.flush();
        em.clear();

        // then
        ReviewLike foundLike = em.find(ReviewLike.class, reviewLike.getId());
        assertThat(foundLike).isNotNull();
        assertThat(foundLike.getReview().getId()).isEqualTo(savedReview.getId());
        assertThat(foundLike.getMember().getId()).isEqualTo(testMember.getId());
    }
}
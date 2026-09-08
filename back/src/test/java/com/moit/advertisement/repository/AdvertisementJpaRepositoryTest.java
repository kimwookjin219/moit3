package com.moit.advertisement.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.moit.advertisement.entity.Advertisement;
import com.moit.member.entity.Member;
import com.moit.member.entity.MemberStatus;
import com.moit.member.entity.MemberType;
import com.moit.member.repository.MemberRepository;
import com.moit.member.repository.MemberStatusRepository;
import com.moit.member.repository.MemberTypeRepository;

@DataJpaTest
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE
)
@EnableJpaRepositories(
    basePackageClasses = {
        AdvertisementRepository.class,
        AdvertisementImageRepository.class,
        AdvertisementTargetRegionRepository.class,
        AdvertisementPaymentRepository.class,
        AdvertisementPriceRepository.class,
        AdvertisementPositionPriceRepository.class,
        AdvertisementDailyStatisticsRepository.class,
        MemberRepository.class,
        MemberTypeRepository.class,
        MemberStatusRepository.class
    }
)
@ImportAutoConfiguration(exclude = {
    JpaRepositoriesAutoConfiguration.class
})
class AdvertisementJpaRepositoryTest {


    @Autowired private AdvertisementRepository advertisementRepository;

    @Autowired private MemberRepository memberRepository;
    @Autowired private MemberTypeRepository memberTypeRepository;
    @Autowired private MemberStatusRepository memberStatusRepository;


    private Member testMember;


    @BeforeEach
    void setUp(){

        MemberType type = new MemberType();
        type.setMemberTypeId(1L);
        type.setTypeName("ROLE_PARTNER");

        memberTypeRepository.saveAndFlush(type);


        MemberStatus status = new MemberStatus();
        status.setStatusId(1L);
        status.setStatusName("ACTIVE");

        memberStatusRepository.saveAndFlush(status);



        Member member = new Member();

        member.setLoginId(
            "advertiseTest_" + System.currentTimeMillis()
        );

        member.setEmail(
            "ad" + System.currentTimeMillis() + "@test.com"
        );

        member.setNickname(
            "광고테스트_" + System.currentTimeMillis()
        );

        member.setPassword("1234");

        member.setMemberType(type);
        member.setMemberStatus(status);


        testMember = memberRepository.saveAndFlush(member);
    }
    
    
    @Test
    @DisplayName("광고 JPA 저장 테스트")
    void advertisementSaveTest(){


        Advertisement advertisement =
            Advertisement.builder()
            .title("JPA 테스트 광고")
            .content("저장 테스트")
            .landingUrl("https://test.com")
            .startDatetime(LocalDateTime.now())
            .endDatetime(LocalDateTime.now().plusDays(7))
            .advertiser(testMember)
            .build();

        Advertisement saved =
            advertisementRepository.save(advertisement);

        assertThat(saved.getAdId())
            .isNotNull();

        System.out.println(
            "생성 ID : " + saved.getAdId()
        );
    }


    @Test
    @DisplayName("광고 단건 조회 JPA 테스트")
    void advertisementFindTest(){


        Advertisement advertisement =
            Advertisement.builder()
            .title("조회 테스트 광고")
            .content("조회")
            .landingUrl("https://test.com")
            .startDatetime(LocalDateTime.now())
            .endDatetime(LocalDateTime.now().plusDays(7))
            .advertiser(testMember)
            .build();



        Advertisement saved =
            advertisementRepository.save(advertisement);



        Advertisement result =
            advertisementRepository.findById(saved.getAdId())
            .orElseThrow();



        System.out.println(
            "단건 조회>>>>>> " + result.getTitle()
        );


        assertThat(result.getAdId())
            .isEqualTo(saved.getAdId());

    }
    
    @Test
    @DisplayName("광고 전체 조회")
    void advertisementFindAllTest() {

        Advertisement advertisement =
            Advertisement.builder()
                .title("전체 조회 테스트 광고")
                .content("전체 조회")
                .landingUrl("https://test.com")
                .startDatetime(LocalDateTime.now())
                .endDatetime(LocalDateTime.now().plusDays(7))
                .advertiser(testMember)
                .build();

        advertisementRepository.saveAndFlush(advertisement);

        List<Advertisement> list =
            advertisementRepository.findAll();

        assertThat(list).isNotEmpty();

        assertThat(list)
            .extracting(Advertisement::getTitle)
            .contains("전체 조회 테스트 광고");

        System.out.println("개수 : " + list.size());
    }
}
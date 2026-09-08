package com.moit.meetup.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.moit.security.PasswordLeakService;


@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnableJpaRepositories(basePackageClasses = {
        MeetupRepository.class,
        MeetupApplicationRepository.class,
        MeetupCategoryRepository.class,
        MeetupImageRepository.class,
        MeetupLikesRepository.class
})
class MeetupRepositoryTest {

    @Autowired
    private MeetupApplicationRepository meetupApplicationRepository;
    @Autowired
    private MeetupCategoryRepository meetupCategoryRepository;
    @Autowired
    private MeetupImageRepository meetupImageRepository;
    @Autowired
    private MeetupLikesRepository meetupLikesRepository;
    @Autowired
    private MeetupRepository meetupRepository;

    @Test
    @DisplayName("모임 Repository 전체 Bean 생성 테스트")
    void repositoryBeanTest() {

        assertThat(meetupApplicationRepository).isNotNull();
        assertThat(meetupCategoryRepository).isNotNull();
        assertThat(meetupImageRepository).isNotNull();
        assertThat(meetupLikesRepository).isNotNull();
        assertThat(meetupRepository).isNotNull();
    }
}
package com.moit.meetup.repository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.BDDMockito;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.moit.meetup.dto.MeetupDto.MeetupRequestDto;
import com.moit.meetup.dto.MeetupDto.MeetupResponseDto;
import com.moit.meetup.entity.Meetup;
import com.moit.meetup.service.MeetupServiceImpl;
import com.moit.member.entity.Member;
import com.moit.member.repository.MemberRepository;

@ExtendWith(MockitoExtension.class)
class MeetupServiceTest {

    @InjectMocks MeetupServiceImpl meetupService; // 테스트 대상

    @Mock MemberRepository memberRepository; // 가짜 레포지토리
    @Mock MeetupRepository meetupRepository;
    @Mock MeetupApplicationRepository meetupApplicationRepository;
    
    @Test
    @DisplayName("★ 순수 단위테스트 : 모임 저장 성공")
    void create() {
        // given: memberRepository.findById() 호출 시 가짜 Member 반환하도록 세팅
        BDDMockito.given(memberRepository.findById(1L))
                  .willReturn(Optional.of(new Member()));

     // 1. DTO 객체 생성 및 테스트 데이터 세팅
        MeetupRequestDto dto = new MeetupRequestDto();
        dto.setTitle("테스트");
        dto.setMaxParticipants(10);
        dto.setMinParticipants(1);

        // 2. 서비스 메서드 호출 시 데이터 전달용으로 전달
        meetupService.create(dto, 1L);
    }
    
    @Test
    @DisplayName("★ 순수 단위테스트 : 모임 상세조회 성공")
    void detail() {
        // [GIVEN] DB 대신 meetupRepository가 가짜 Meetup 엔티티를 반환하도록 세팅
        Meetup fakeMeetup = new Meetup();
        fakeMeetup.setId(100L);
        fakeMeetup.setTitle("테스트 모임");
        fakeMeetup.setMaxParticipants(10);

        given(meetupRepository.findById(100L)).willReturn(Optional.of(fakeMeetup));

        // [WHEN] 상세 조회 메서드 실행
        MeetupResponseDto result = meetupService.detail(100L, 1L);

        // [THEN] 반환된 DTO 값 검증
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("테스트 모임");
    }

}
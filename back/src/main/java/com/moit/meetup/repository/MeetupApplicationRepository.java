package com.moit.meetup.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.meetup.dto.MeetupParticipantCountDto;
import com.moit.meetup.entity.MeetupApplication;
import com.moit.meetup.enums.ApplyStatus;

@Repository
public interface MeetupApplicationRepository extends JpaRepository<MeetupApplication, Long>{
	
	//모임 신청 조회
	Optional<MeetupApplication> findByMeetup_IdAndMember_Id(Long meetupId, Long memberId);
	
	//마이페이지 내가 신청한 모집글 목록 조회(페이징)
	Page<MeetupApplication> findByMember_IdOrderByUpdatedAtDesc(Long memberId, Pageable pageable);	
	
	//신청자 목록 조회
	Page<MeetupApplication>findByMeetup_IdAndMeetup_Member_IdAndApplyStatusNotIn(Long meetupId, Long memberId, List<ApplyStatus> applyStatuses, Pageable pageable);
	
	long countByMeetupIdAndApplyStatus(Long meetupId, ApplyStatus applyStatus);
	
	//노쇼 카운트
	@Query("""
		    SELECT COUNT(ma)
		    FROM MeetupApplication ma
		    WHERE ma.member.id = :memberId
		      AND ma.applyStatus = com.moit.meetup.enums.ApplyStatus.NOSHOW
		""")
		Long countNoShowByMemberId(@Param("memberId") Long memberId);
	
	@Query("""
		    SELECT new com.moit.meetup.dto.MeetupParticipantCountDto(
		        ma.meetup.id,
		        COUNT(ma.id)
		    )
		    FROM MeetupApplication ma
		    WHERE ma.meetup.id IN :meetupList
		      AND ma.applyStatus = :applyStatus
		      AND ma.deleteYn = :deleteYn
		    GROUP BY ma.meetup.id
		""")
		List<MeetupParticipantCountDto > countByMeetup_IdInAndApplyStatusAndDeleteYn(
		        @Param("meetupList") List<Long> meetupList,
		        @Param("applyStatus") ApplyStatus applyStatus,
		        @Param("deleteYn") Character deleteYn
		);
}

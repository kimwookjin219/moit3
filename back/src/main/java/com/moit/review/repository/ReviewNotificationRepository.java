package com.moit.review.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.meetup.entity.Meetup;
import com.moit.review.entity.ReviewNotification;

@Repository
public interface ReviewNotificationRepository extends JpaRepository<ReviewNotification, Long>{
	
	List<ReviewNotification> findByMemberIdOrderByCreatedAtDesc(Long memberId);
	
	boolean existsByMemberIdAndMeetupId(Long memberId, Long meetupId);
	
	Optional<ReviewNotification> findByMemberIdAndMeetupId(Long memberId, Long meetupId);
	
	
	@Query("""
			SELECT m 
			FROM Meetup m
			WHERE m.meetupAt < :targetTimeStr
			  AND m.deleteYn = 'N'
			  AND m.meetupStatus = com.moit.meetup.enums.MeetupStatus.COMPLETED
		""")
	List<Meetup> findFinishedMeetups(@Param("targetTimeStr") LocalDateTime targetTimeStr);
}
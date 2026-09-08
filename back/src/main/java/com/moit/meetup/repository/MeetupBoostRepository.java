package com.moit.meetup.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.meetup.entity.MeetupBoost;

public interface MeetupBoostRepository extends JpaRepository<MeetupBoost, Long>{
	
	//Boolean existsByMeetup_IdAndCreatedAtAfter(Long meetupId, LocalDateTime dateTime);
}

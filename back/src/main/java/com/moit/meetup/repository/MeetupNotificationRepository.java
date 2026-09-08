package com.moit.meetup.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.meetup.entity.Meetup;
import com.moit.meetup.entity.MeetupNotification;
import com.moit.meetup.enums.MeetupNotificationType;
import com.moit.member.entity.Member;

public interface MeetupNotificationRepository extends JpaRepository<MeetupNotification, Long>{
	boolean existsByMeetupAndMemberAndMeetupNotificationType(
	        Meetup meetup, Member member, MeetupNotificationType type);
	
	List<MeetupNotification> findByMeetupAndMeetupNotificationType(
	        Meetup meetup, MeetupNotificationType type);
}

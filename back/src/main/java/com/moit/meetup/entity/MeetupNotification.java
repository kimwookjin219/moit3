package com.moit.meetup.entity;

import java.time.LocalDateTime;

import com.moit.meetup.enums.MeetupNotificationSendStatus;
import com.moit.meetup.enums.MeetupNotificationType;
import com.moit.member.entity.Member;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="meetup_notifications")
public class MeetupNotification extends BaseEntity{
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "meetup_id", nullable = false)
	private Meetup meetup;
	
	@ManyToOne
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 20)
	private MeetupNotificationType meetupNotificationType;
	
	@Column(name = "phone_number", nullable = false, length = 20)
	private String phoneNumber;
	
	@Lob
	@Column(name = "message", columnDefinition = "CLOB")
	private String message;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "send_status", nullable = false, length = 10)
	private MeetupNotificationSendStatus meetupNotificationSendStatus;
	
	@Column(name = "sent_at")
	private LocalDateTime sentAt;
}

package com.moit.meetup.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moit.meetup.dto.MeetupCountResponseDto;
import com.moit.meetup.dto.MyMeetupCountResponseDto;
import com.moit.meetup.dto.PopularMeetupResponseDto;
import com.moit.meetup.entity.Meetup;
import com.moit.meetup.enums.MeetupStatus;

@Repository
public interface MeetupRepository extends JpaRepository<Meetup, Long>{
	Optional<Meetup> findByIdAndMemberId(Long meetupId, Long memberId);
	
	Page<Meetup> findAll(Pageable pageable);
	
	//개설한모임 카운트
	long countByMemberIdAndDeleteYn(Long MemberId, Character deleteYn);
	
	//완료카운트
	long countByMemberIdAndMeetupStatusAndDeleteYn(
	        Long memberId,
	        MeetupStatus meetupStatus,
	        Character deleteYn
	);
	
	//하루모임등록3개제한
	/*
	 m.createdAt < :startOfNextDay -> 23:59:59
	*/
	@Query("""
		    SELECT COUNT(m)
		    FROM Meetup m
		    WHERE m.member.id = :memberId
		      AND m.createdAt >= :startOfDay
		      AND m.createdAt < :startOfNextDay
		""")
	long countTodayCreatedMeetups(@Param("memberId") Long memberId
								, @Param("startOfDay") LocalDateTime  startOfDay
								, @Param("startOfNextDay") LocalDateTime startOfNextDay);
	
	//관리자/사용자 모임조회
	@Query("""
		    SELECT m
		    FROM Meetup m
			LEFT JOIN MeetupBoost mb ON mb.meetup = m AND mb.startDate <= CURRENT_DATE
													  AND mb.endDate >= CURRENT_DATE
													  AND mb.createdAt = (
													    SELECT MAX(mb2.createdAt)
													    FROM MeetupBoost mb2
													    WHERE mb2.meetup = m
													      AND mb2.startDate <= CURRENT_DATE
													      AND mb2.endDate >= CURRENT_DATE
													  )	
			LEFT JOIN MeetupLike ml ON ml.meetup = m
			        													    
		    WHERE m.deleteYn = :deleteYn

		      AND m.meetupStatus IN (
		          com.moit.meetup.enums.MeetupStatus.RECRUITING,
		          com.moit.meetup.enums.MeetupStatus.COMPLETED
		      )

		      AND (
		          :status IS NULL
		          OR m.meetupStatus = :status
		      )

			  AND (
			      :searchText IS NULL
			      OR :searchText = ''
			      OR (
			          :searchType = 'title'
			          AND m.title LIKE CONCAT('%', :searchText, '%')
			      )
			      OR (
			          :searchType = 'name'
			          AND m.member.nickname LIKE CONCAT('%', :searchText, '%')
			      )
			      OR (
			          :searchType IS NULL
			          AND (
			              m.title LIKE CONCAT('%', :searchText, '%')
			              OR m.member.nickname LIKE CONCAT('%', :searchText, '%')
			          )
			      )
			  )

		      AND (
		          :sidoId IS NULL
		          OR m.sigungu.sido.id = :sidoId
		      )

			  AND (
			      :categoryId IS NULL
			      OR m.meetupCategory.id = :categoryId
			      OR m.meetupCategory.parent.id = :categoryId
			  )

		      ORDER BY
			    CASE
			        WHEN mb.createdAt IS NOT NULL THEN 0
			        ELSE 1
			    END ASC,
			
			    mb.createdAt DESC,

				  
				CASE
				    WHEN :orderType = 'createAt'
				    THEN m.createdAt
				END DESC,
				
			    CASE
			        WHEN :orderType = 'like'
			        THEN (
			            SELECT COUNT(ml)
			            FROM MeetupLike ml
			            WHERE ml.meetup = m
			        )
			    END DESC,
        
				CASE
				    WHEN :orderType = 'meetupAt'
				    THEN m.meetupAt
				END ASC
		""")
	Page<Meetup> findByDeleteYn(
	        @Param("deleteYn") Character deleteYn,
	        @Param("status") MeetupStatus status,
	        @Param("searchType") String searchType,
	        @Param("searchText") String searchText,
	        @Param("sidoId") Long sidoId,
	        @Param("categoryId") Long categoryId,
	        @Param("orderType") String orderType,
	        Pageable pageable
	);
	
	Page<Meetup> findByMember_IdAndDeleteYnOrderByCreatedAtDesc(Long memberId, Character deleteYn, Pageable  pageable);
	
	//관리자 통계
	@Query("""
		    SELECT new com.moit.meetup.dto.MeetupCountResponseDto(
		        COUNT(m),
		        COUNT(CASE 
		            WHEN m.meetupStatus = com.moit.meetup.enums.MeetupStatus.RECRUITING 
		            THEN 1 
		        END),
		        COUNT(CASE 
		            WHEN m.meetupStatus = com.moit.meetup.enums.MeetupStatus.COMPLETED 
		            THEN 1 
		        END),
		        COUNT(CASE 
		            WHEN m.meetupStatus = com.moit.meetup.enums.MeetupStatus.WEATHER_CANCELED 
		            THEN 1 
		        END)
		    )
		    FROM Meetup m
		    WHERE m.deleteYn = 'N'
		""")
	MeetupCountResponseDto getMeetupCount();
	
	//마이페이지 통계
	@Query("""
		    SELECT new com.moit.meetup.dto.MyMeetupCountResponseDto(
		        COUNT(DISTINCT CASE WHEN m.member.id = :memberId THEN m.id END),
		        COUNT(DISTINCT ma.meetup.id),
		        COUNT(DISTINCT r.id),
		        COUNT(DISTINCT ml.id)
		    )
		    FROM Meetup m

		    LEFT JOIN MeetupApplication ma
		        ON ma.member.id = :memberId
		        AND ma.meetup.id = m.id

		    LEFT JOIN Review r
		        ON r.member.id = :memberId
		        AND r.meetup.id = m.id
		        AND r.deleteYn = 'N'

		    LEFT JOIN MeetupLike ml
		        ON ml.member.id = :memberId
		        AND ml.meetup.id = m.id

		    WHERE m.deleteYn = 'N'
		""")
		MyMeetupCountResponseDto getMyMeetupCount(
		    @Param("memberId") Long memberId
		);
	
	// 인기모임
	@Query("""
		    SELECT new com.moit.meetup.dto.PopularMeetupResponseDto(
		        m.id,
		        m.title,
		        m.member.nickname,
		        m.meetupAt,
		        m.sigungu.sido.name,
		        m.sigungu.name,
		        MIN(image.imagePath),
		        COUNT(DISTINCT ml),
		        m.maxParticipants,
		        m.minParticipants
		    )
		    FROM Meetup m
		    LEFT JOIN m.meetupLike ml
		    LEFT JOIN m.meetupImages img
		    LEFT JOIN img.image image
		    WHERE m.hidden = false
		      AND m.meetupStatus = com.moit.meetup.enums.MeetupStatus.RECRUITING
		    GROUP BY
		        m.id,
		        m.title,
		        m.member.nickname,
		        m.meetupAt,
		        m.sigungu.sido.name,
		        m.sigungu.name,
		        m.maxParticipants,
		        m.minParticipants
		    ORDER BY COUNT(DISTINCT ml) DESC, m.id DESC
		""")
		List<PopularMeetupResponseDto> findPopularMeetups(Pageable pageable);
	
	//추천모임	
	@Query("""
		    SELECT m
		    FROM Meetup m
		    JOIN m.meetupCategory category
		    WHERE m.deleteYn = 'N'
		      AND m.id <> :meetupId
		      AND m.hidden = false
		      AND m.meetupStatus =
		          com.moit.meetup.enums.MeetupStatus.RECRUITING
		      AND EXISTS (
		          SELECT 1
		          FROM MemberInterest mi
		          WHERE mi.member.id = :memberId
		            AND mi.interest.interestId =
		                CASE
		                    WHEN category.parent IS NULL
		                    THEN category.id
		                    ELSE category.parent.id
		                END
		      )
		    ORDER BY FUNCTION('DBMS_RANDOM.VALUE')
		""")
		List<Meetup> findRecommendedMeetups(
		        @Param("memberId") Long memberId,
		        @Param("meetupId") Long meetupId,
		        Pageable pageable
		);
	
	@Query("""
		    SELECT m
		    FROM Meetup m
		    WHERE m.deleteYn = 'N'
		      AND m.id <> :meetupId		      
		      AND m.hidden = false
		      AND m.meetupStatus =
		          com.moit.meetup.enums.MeetupStatus.RECRUITING
		    ORDER BY FUNCTION('DBMS_RANDOM.VALUE')
		""")
		List<Meetup> findRandomMeetups(
		        @Param("meetupId") Long meetupId,
		        Pageable pageable
		);
	
	// 내일 진행예정인 모임 조회
	@Query("""
			SELECT m
			FROM Meetup m
			WHERE m.meetupAt >= :start
			  AND m.meetupAt < :end
			  AND m.meetupStatus = 'RECRUITING'
	""")
	List<Meetup> findTomorrowMeetups(
		    @Param("start") LocalDateTime start,
		    @Param("end") LocalDateTime end
		);
}
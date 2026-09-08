package com.moit.meetup.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moit.meetup.dto.MeetupLikeCountDto;
import com.moit.meetup.dto.MeetupLikeDto;
import com.moit.meetup.dto.MeetupParticipantCountDto;
import com.moit.meetup.entity.MeetupLike;
import com.moit.meetup.enums.ApplyStatus;

@Repository
public interface MeetupLikesRepository extends JpaRepository<MeetupLike, Long>{
	//특정 게시글 좋아요 수 집계
	long countByMeetup_Id(Long meetup);
	
	//특정 유저가 특정게시글에 좋아요 했는지 Member member 필드와 Meetup meetup 각각의 id가 있는지 확인
	long countByMember_IdAndMeetup_Id(Long memberId, Long meetupId);
	
	//특정 유저가 특정게시글에 좋아요 했는지 존재여부
	boolean existsByMember_IdAndMeetup_Id(Long memberId, Long meetupId);
	
	//특정유저가 특정게시글에 좋아요 했는지 조회
	Optional<MeetupLike> findByMember_IdAndMeetup_Id(Long memberId, Long meetupId);
	
	// 좋아요취소
	// 방법1: long deleteByUser_idPost_Id(Long userId, Long postId); -> select (데이터베이스 조회) delete(개별삭제)
	// 방법2: @Query(select 조회용도) -> db 가서 바로 delete
	// Insert/Update/Delete @Modifying @Transactional
	// DELETE FROM PostLike pl WHERE pl.member.memberId = :memberId AND pl.meetup.id = :meetupId;	
	@Modifying // 조회가 아니라 update, delete 용도
	@Transactional
	@Query("DELETE FROM MeetupLike ml WHERE ml.member.id = :memberId AND ml.meetup.id = :meetupId")
	void deleteByMember_IdAndMeetup_Id(@Param("memberId") Long memberId, @Param("meetupId") Long meetupId);	
	
	//내가 좋아요 눌렀는지
	@Query("""
		    SELECT new com.moit.meetup.dto.MeetupLikeDto( 
		     ml.meetup.id, ml.member.id)
		     
		    FROM MeetupLike ml
		    WHERE ml.meetup.id IN :meetupIds
		      AND ml.member.id = :memberId
		""")
		List<MeetupLikeDto> findLikedMeetups(
		        @Param("meetupIds") List<Long> meetupIds,
		        @Param("memberId") Long memberId
		);
	
	//좋아요 갯수
	@Query("""
		    SELECT new com.moit.meetup.dto.MeetupLikeCountDto(
		        ml.meetup.id,
		        COUNT(ml.id)
		    )
			  FROM MeetupLike ml
			 WHERE ml.meetup.id IN :meetupList
			 GROUP BY ml.meetup.id
		""")
		List<MeetupLikeCountDto> countByMeetup_Id(
		        @Param("meetupList") List<Long> meetupList
		);
}
 
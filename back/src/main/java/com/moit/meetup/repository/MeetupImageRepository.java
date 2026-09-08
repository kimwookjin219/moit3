package com.moit.meetup.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.meetup.entity.MeetupImage;

@Repository
public interface MeetupImageRepository extends JpaRepository<MeetupImage, Long>{

}

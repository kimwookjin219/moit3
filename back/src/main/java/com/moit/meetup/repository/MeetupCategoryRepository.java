package com.moit.meetup.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moit.meetup.entity.MeetupCategory;

@Repository
public interface MeetupCategoryRepository extends JpaRepository<MeetupCategory, Long>{

}

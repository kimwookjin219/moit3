package com.moit.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.common.entity.Image;

public interface ImageRepository extends JpaRepository<Image, Long>{

}

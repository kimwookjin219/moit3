package com.moit.common.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.moit.common.entity.Sido;

public interface SidoRepository extends JpaRepository<Sido, Long>{
	Optional<Sido> findByName(String name);
}

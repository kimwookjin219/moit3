package com.moit.util;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {
	
	@Column(nullable = false, columnDefinition = "CHAR(1) DEFAULT 'N'")
	private Character deleteYn = 'N';
	
	@CreationTimestamp
	@Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
	
	@UpdateTimestamp  
	 @Column(nullable = false)
	private LocalDateTime updatedAt;
}

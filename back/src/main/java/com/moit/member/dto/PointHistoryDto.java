package com.moit.member.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PointHistoryDto {
	
	private Long  historyId;
	private Integer pointPm;
	private String pointType;
	private String pointReason;
	private LocalDateTime createdAt;
}

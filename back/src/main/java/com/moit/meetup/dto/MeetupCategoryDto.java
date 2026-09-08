package com.moit.meetup.dto;


import com.moit.meetup.entity.MeetupCategory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeetupCategoryDto {
	private Long id;
	private Long parentId;
	private String categoryName;
	
	public static MeetupCategoryDto from(MeetupCategory meetupCategory) {
		
		Long parentId = meetupCategory.getParent() != null ? meetupCategory.getParent().getId() : null; 
		
		return MeetupCategoryDto.builder()
						  .id(meetupCategory.getId())
						  .categoryName(meetupCategory.getCategoryName())
						  .parentId(parentId)
						  .build();
	}
	
}

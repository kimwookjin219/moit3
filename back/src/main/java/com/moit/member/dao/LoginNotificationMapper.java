package com.moit.member.dao;

import org.apache.ibatis.annotations.Mapper;

import com.moit.member.dto.NewDeviceNotificationDto;

@Mapper
public interface LoginNotificationMapper {

    void insertNewDeviceNotification(
            NewDeviceNotificationDto dto
    );

}
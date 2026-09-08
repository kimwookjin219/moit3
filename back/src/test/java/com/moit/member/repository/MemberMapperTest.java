package com.moit.member.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.moit.member.dao.UserMapper;
import com.moit.member.dto.AuthUserDto;
import com.moit.member.dto.InterestDto;
import com.moit.member.dto.UserDto;

@SpringBootTest
@Transactional
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    //-----------------------------------------------
    // Bean 생성 확인
    //-----------------------------------------------
    @Test
    @DisplayName("■ UserMapper Bean 생성")
    void mapperBeanTest() {

        assertThat(userMapper).isNotNull();

    }

    //-----------------------------------------------
    // 로그인 정보 조회
    //-----------------------------------------------
    @Test
    @DisplayName("■ readByLoginId()")
    void readByLoginIdTest() {

        AuthUserDto result = userMapper.readByLoginId("admin");

        assertThat(result).isNotNull();

    }

    //-----------------------------------------------
    // 회원 조회
    //-----------------------------------------------
    @Test
    @DisplayName("■ findUser()")
    void findUserTest() {

        Map<String,Object> map = new HashMap<>();
        map.put("loginId", "admin");

        UserDto user = userMapper.findUser(map);

        assertThat(user).isNotNull();

    }

    //-----------------------------------------------
    // 회원 목록 조회
    //-----------------------------------------------
    @Test
    @DisplayName("■ select10()")
    void select10Test() {

        Map<String,Object> map = new HashMap<>();
        map.put("start",1);
        map.put("end",10);

        List<UserDto> list = userMapper.select10(map);

        assertThat(list).isNotNull();

    }

    //-----------------------------------------------
    // 회원 수 조회
    //-----------------------------------------------
    @Test
    @DisplayName("■ selectCnt()")
    void selectCntTest() {

        Map<String,Object> map = new HashMap<>();

        int count = userMapper.selectCnt(map);

        assertThat(count).isGreaterThanOrEqualTo(0);

    }

    //-----------------------------------------------
    // 관심사 전체 조회
    //-----------------------------------------------
    @Test
    @DisplayName("■ selectAllInterest()")
    void selectAllInterestTest() {

        List<InterestDto> list = userMapper.selectAllInterest();

        assertThat(list).isNotNull();

    }

}
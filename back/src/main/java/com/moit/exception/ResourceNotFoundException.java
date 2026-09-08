package com.moit.exception;

// 상황별 의미있는 만들고싶은 예외를 정의
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
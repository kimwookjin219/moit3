package com.moit.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class PasswordUtil {
	private PasswordUtil() {}
	public static String sha1(String password) {
		
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-1");
			
			byte[] bytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
			
			StringBuilder sb = new StringBuilder();
			
			for(byte b : bytes) {
				sb.append(String.format("%02x", b));
			}
			return sb.toString();
		}catch(Exception e) { throw new RuntimeException("SHA-1 생성실패",e); }
	}
}

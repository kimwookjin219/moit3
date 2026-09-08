package com.moit.member.oauth2;

public interface UserInfoOAuth2 {
	public String getProvider();
	public String getProviderId();
	public String getEmail();
	public String getNickname();
	public String getImage();
}
/*
1. provider   = "local" / "google" , "kakao" , "naver"
2. providerId = google → sub , kakao/facebook   → id, naver  → response
*/
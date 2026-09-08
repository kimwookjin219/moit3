package com.moit.member.oauth2;

import java.util.Map;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class UserGoogle implements UserInfoOAuth2{
	private final Map<String,Object> attributes;

	@Override public String getProvider() { return "google"; }
	@Override public String getProviderId() { 
		Object sub = attributes.get("sub");
		return sub != null? sub.toString() : null; 
	}

	@Override public String getEmail() {
		Object email = attributes.get("email");
		return email != null? email.toString() : null; 
	}

	@Override public String getNickname() { 
		Object name = attributes.get("name");
		return name != null? name.toString() : null; 
	}

	@Override public String getImage() { 
		Object profile = attributes.get("profile");
		return profile != null? profile.toString() : "moit.png"; 
	}
	
	
}
/*
<google>
{
   sub=103058387739722400130, 
   name=안효정, 
   given_name=효정, 
   family_name=안, 
   picture=https://lh3.googleusercontent.com/a/AEdFTp5SiCyTaOLog9sDPN6QhWwsUj7xPbfj4HQF0fdC=s96-c, 
   email=sally03915@gmail.com, 
   email_verified=true, 
   locale=ko
}

*/
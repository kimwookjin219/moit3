package com.moit.member.oauth2;

import java.util.Map;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class UserKakao implements UserInfoOAuth2{
	private final Map<String,Object> attributes;

	@SuppressWarnings("unchecked")
    private Map<String, Object> getAccount() {
        Object account = attributes != null ? attributes.get("kakao_account") : null;
        if (account instanceof Map) {
            return (Map<String, Object>) account;
        }
        return null;
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        Object id = attributes != null ? attributes.get("id") : null;
        return id != null ? id.toString() : null;
    }

    @Override
    public String getEmail() {
        Map<String, Object> account = getAccount();
        if (account == null) return null;
        Object email = account.get("email");
        return email != null ? email.toString() : null;
    }

    @SuppressWarnings("unchecked")
    @Override
    public String getNickname() {
        Map<String, Object> account = getAccount();
        if (account == null) return null;

        Object profileObj = account.get("profile");
        if (!(profileObj instanceof Map)) return null;

        Map<String, Object> profile = (Map<String, Object>) profileObj;
        Object nickname = profile.get("nickname");
        return nickname != null ? nickname.toString() : null;
    }

    @SuppressWarnings("unchecked")
    @Override
    public String getImage() {
        Map<String, Object> account = getAccount();
        if (account == null) return null;

        Object profileObj = account.get("profile");
        if (!(profileObj instanceof Map)) return null;

        Map<String, Object> profile = (Map<String, Object>) profileObj;
        Object imageUrl = profile.get("profile_image_url");
        return imageUrl != null ? imageUrl.toString() : null;
    }
	
	
}
/*
<kakao>
{
    id=2632890179, 
    connected_at=2023-01-22T08:17:54Z, 
    properties = {nickname=효정}, 
    kakao_account = {
        profile_nickname_needs_agreement=false, 
        profile={nickname=효정}, 
        has_email=true, 
        email_needs_agreement=false, 
        is_email_valid=true, 
        is_email_verified=true, 
        email=sally03915@naver.com
    }
}
*/
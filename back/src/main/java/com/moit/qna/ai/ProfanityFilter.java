package com.moit.qna.ai;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class ProfanityFilter {

    private static final List<String> BAD_WORDS = List.of(
        "시발",
        "씨발",
        "병신",
        "개새끼",
        "좆",
        "죽어",
        "꺼져",
        "ㅅㅂ"
    );

    public boolean containsBadWord(String text){
        if(text == null){ return false; }
        String target = text.replaceAll("\\s+", "");
        
        for(String word : BAD_WORDS){
            if(target.contains(word)){ return true; }
        }
        return false;
    }

}
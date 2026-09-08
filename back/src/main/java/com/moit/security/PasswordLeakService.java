package com.moit.security;

import java.net.URI;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PasswordLeakService {

    private final RestTemplate restTemplate;

    public PasswordLeakService(org.springframework.boot.web.client.RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public int getLeakCount(String password) {

        try {
            String hash = PasswordUtil.sha1(password);
            String prefix = hash.substring(0, 5);
            String suffix = hash.substring(5);
            HttpHeaders headers = new HttpHeaders();

            headers.add("User-Agent", "MOIT");

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            URI.create("https://api.pwnedpasswords.com/range/" + prefix),
                            HttpMethod.GET,
                            entity,
                            String.class);

            if (response.getBody() == null) { return -1; }

            String[] lines = response.getBody().split("\\r?\\n");

            for (String line : lines) {
                String[] arr = line.split(":");

                if (arr.length != 2) { continue; }
                if (arr[0].equalsIgnoreCase(suffix)) { return Integer.parseInt(arr[1]); }
            }

            return 0;

        } catch (Exception e) {
            e.printStackTrace();

            return -1;

        }
    }
}
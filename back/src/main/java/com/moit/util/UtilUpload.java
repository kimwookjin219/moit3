package com.moit.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

@Component //내가 만든 부품이야
public class UtilUpload {
	@Value("${resource.path}") private String resourcePath;// C:/upload -> application.properties

	private static final Set<String> ALLOWED_EXTENSIONS =
	        Set.of("jpg", "jpeg", "png", "webp");
	
	// 방식 A: 경로를 지정 안 하면 기본 경로(defaultPath) 사용
    public String fileUpload(MultipartFile file) throws IOException {	
        return fileUpload(file, resourcePath); 
    }
    
    // 방식 B: 경로를 지정하면 해당 경로 사용 (핵심 로직은 여기서 처리)
    public String fileUpload(MultipartFile file, String subPath) throws IOException {

        // C:/upload
        Path basePath = Paths.get(resourcePath)
                .toAbsolutePath()
                .normalize();

        // C:/upload/meetup
        Path uploadPath = basePath;

        if (subPath != null && !subPath.isBlank()) {
            uploadPath = basePath
                    .resolve(subPath)
                    .normalize();
        }

        // 업로드 경로가 기본 업로드 폴더 밖으로 나가는지 확인
        if (!uploadPath.startsWith(basePath)) {
            throw new IOException("잘못된 업로드 경로입니다.");
        }

        // 폴더 생성
        Files.createDirectories(uploadPath);

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IOException("파일명이 없습니다.");
        }

        // 확장자 추출
        int lastDot = originalFilename.lastIndexOf(".");

        if (lastDot <= 0 || lastDot == originalFilename.length() - 1) {
            throw new IOException("파일 확장자가 없습니다.");
        }

        String extension = originalFilename
                .substring(lastDot + 1)
                .toLowerCase();

        // 확장자 검사
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IOException("허용되지 않는 파일 형식입니다.");
        }

        // 원본 파일명은 사용하지 않고 서버에서 안전한 파일명 생성
        String saveFilename =
                UUID.randomUUID() + "." + extension;

        Path targetPath = uploadPath
                .resolve(saveFilename)
                .normalize();

        // 최종 경로 검증
        if (!targetPath.startsWith(uploadPath)) {
            throw new IOException("잘못된 파일 경로입니다.");
        }

        FileCopyUtils.copy(
                file.getBytes(),
                targetPath.toFile()
        );

        return saveFilename;
    }
    
    public void fileDelete(String fileName, String subPath) {

        Path basePath = Paths.get(resourcePath)
                .toAbsolutePath()
                .normalize();

        Path deletePath = basePath;

        if (subPath != null && !subPath.isBlank()) {
            deletePath = basePath
                    .resolve(subPath)
                    .normalize();
        }

        // subPath가 업로드 기본 경로 밖으로 나가는지 확인
        if (!deletePath.startsWith(basePath)) {
            throw new IllegalArgumentException(
                    "잘못된 파일 경로입니다."
            );
        }

        Path targetPath = deletePath
                .resolve(fileName)
                .normalize();

        // 최종 파일 경로가 업로드 폴더 밖으로 나가는지 확인
        if (!targetPath.startsWith(deletePath)) {
            throw new IllegalArgumentException(
                    "잘못된 파일 경로입니다."
            );
        }

        try {
            if (Files.exists(targetPath)) {

                Files.delete(targetPath);

            } else {
                System.out.println("삭제할 파일이 존재하지 않습니다.");
            }

        } catch (IOException e) {
            throw new RuntimeException(
                    "파일 삭제에 실패했습니다: " + targetPath,
                    e
            );
        }
    }
//	public String fileUpload(MultipartFile file) throws IOException {	
//		//1. 파일 이름 중복안되게
//		UUID uid = UUID.randomUUID();
//		String save = uid.toString() + "_" + file.getOriginalFilename();
//		//2. 파일업로드
//		File target = new File(resourcePath , save);
//		FileCopyUtils.copy(file.getBytes(), target);
//		return save;		
//	}
	
	//1. 업로드 : 팀미션 : 확장자, 용량 사이즈 고려
	//2. 팀미션 : 글삭제시 파일도 같이 삭제
}

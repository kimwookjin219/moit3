package com.moit.qna.entity;

import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "QUESTION_IMAGES")
@Getter @Setter
public class QuestionImage extends BaseEntity {

    @Id
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "question_image_seq_generator")
    @SequenceGenerator(name = "question_image_seq_generator", sequenceName = "QUESTION_IMAGE_SEQ", allocationSize = 1)
    @Column(name = "IMAGE_ID")
    private Long id;

    // 어떤 문의에 첨부된 이미지인지
    @ManyToOne
    @JoinColumn(name = "QUESTION_ID", nullable = false)
    private Question question;

    @Column(name = "ORIGINAL_NAME", nullable = false)
    private String originalName;

    @Column(name = "STORED_NAME", nullable = false)
    private String storedName;

    @Column(name = "IMAGE_PATH", nullable = false)
    private String imagePath;

    @Column(name = "IMAGE_SIZE")
    private Long imageSize;

    @Column(name = "CONTENT_TYPE")
    private String contentType;

}
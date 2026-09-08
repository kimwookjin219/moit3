package com.moit.qna.entity;

import com.moit.member.entity.Member;
import com.moit.qna.enums.Category;
import com.moit.qna.enums.IsPublic;
import com.moit.qna.enums.QnaStatus;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "QUESTIONS")
@Getter @Setter
public class Question extends BaseEntity{

    @Id
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "question_seq_generator")
    @SequenceGenerator(name = "question_seq_generator", sequenceName = "QUESTION_SEQ", allocationSize = 1)
    @Column(name = "QUESTION_ID")
    private Long id;

    @Column(name = "PARENT_ID", nullable = false)
    private Long parentId;
    
    //유저는 많은 질문을 가질 수 있다
	//    <Member>
	//    @OneToMany( mappedBy = "member" ,cascade = CascadeType.ALL, orphanRemoval = true )
	//    private List<Question> questions = new ArrayList<>(); 
    
    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

	@Enumerated(EnumType.STRING)
	@Column(name = "CATEGORY", length = 20, nullable = false)
    private Category category;
    
	@Enumerated(EnumType.STRING)
	@Column(name = "QNA_STATUS", length = 20, nullable = false)
    private QnaStatus status;
    
	@Enumerated(EnumType.STRING)
	@Column(name = "IS_PUBLIC", length = 20, nullable = false)
    private IsPublic isPublic;

}
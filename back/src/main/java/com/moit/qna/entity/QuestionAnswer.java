package com.moit.qna.entity;

import com.moit.member.entity.Member;
import com.moit.qna.enums.IsPublic;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ANSWERS")
@Getter @Setter
public class QuestionAnswer extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "answer_seq_generator")
    @SequenceGenerator(name = "answer_seq_generator",sequenceName = "ANSWER_SEQ",allocationSize = 1)
    
    @Column(name = "ANSWER_ID")
    private Long answerId;

    //유저는 많은 질문을 가질 수 있다
	//    <Member>
	//    @OneToMany( mappedBy = "member" ,cascade = CascadeType.ALL, orphanRemoval = true )
	//    private List<QuestionAnswer> questionAnswers = new ArrayList<>(); 

    @OneToOne
    @JoinColumn(name = "QUESTION_ID", nullable = false)
    private Question question;
    
    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

	@Enumerated(EnumType.STRING)
	@Column(name = "IS_PUBLIC", length = 20, nullable = false)
    private IsPublic isPublic;
	
	@Column(name = "RATING")
	private Integer rating;

	@Column(name = "FEEDBACK", length = 1000)
	private String feedback;
}
package com.moit.meetup.entity;

import com.moit.common.entity.Image;
import com.moit.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="MEETUP_IMAGES")
public class MeetupImage extends BaseEntity{
   
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(unique = true, nullable = false)
   private Long id;
   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEETUP_ID", nullable = false)
   private Meetup meetup;
   
   
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IMAGE_ID", nullable = false)
    private Image image;
}



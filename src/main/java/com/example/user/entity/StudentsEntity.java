package com.example.user.entity;

import com.example.attend.entity.AttendancesEntity;
import com.example.classes.entity.ClassUsersEntity;
import com.example.evaluations.entity.EvaluationsEntity;
import com.example.schedule.entity.SchoolsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private int studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academy_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private AcademiesEntity academy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UsersEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ParentsEntity parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private SchoolsEntity school;

    @Column
    private Integer grade;

    @Column(length = 50)
    private String room;

    // 내가 속한 클래스(반) 조회를 위함
    @OneToMany(mappedBy = "student", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    private List<ClassUsersEntity> classUsers = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    private List<EvaluationsEntity> evaluations = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AttendancesEntity> attendances = new ArrayList<>();

}

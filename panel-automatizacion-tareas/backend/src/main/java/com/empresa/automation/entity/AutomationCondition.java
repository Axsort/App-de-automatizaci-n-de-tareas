package com.empresa.automation.entity;

import com.empresa.automation.entity.enums.ConditionOperator;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "automation_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomationCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "automation_rule_id", nullable = false)
    private AutomationRule automationRule;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConditionOperator operator;

    @Column(name = "field_value", nullable = false, length = 500)
    private String fieldValue;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}

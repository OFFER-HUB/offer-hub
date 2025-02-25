import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'freelancer_skills' })
export class FreelancerSkill {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  skill_id: string;

  // Relation with user entity commented out for now
  /*
  @ManyToOne(() => User, (user) => user.freelancerSkills, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Skill, (skill) => skill.freelancerSkills, { onDelete: 'CASCADE' })
  skill: Skill;
  */

  @Column({ type: 'varchar', length: 20 })
  experience_level: 'beginner' | 'intermediate' | 'expert';
}
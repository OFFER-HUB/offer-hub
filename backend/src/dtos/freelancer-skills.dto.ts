export class CreateFreelancerSkillDto {
    user_id: string;
    skill_id: string;
    experience_level: 'beginner' | 'intermediate' | 'expert';
}
  
export class UpdateFreelancerSkillDto {
    experience_level?: 'beginner' | 'intermediate' | 'expert';
}
export class SkillResponseDto {
  skill_id?: string;
  category_id?: string;
  name?: string;
  created_at?: Date;
}

export class CreateSkillDto {
  name?: string;
  category_id?: string;
}

export class UpdateSkillDto {
  name?: string;
}

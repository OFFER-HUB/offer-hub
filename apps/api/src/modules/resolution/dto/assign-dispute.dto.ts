import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for assigning a dispute to a support agent.
 */
export class AssignDisputeDto {
    @IsString()
    @IsNotEmpty()
    assignedTo!: string;
}

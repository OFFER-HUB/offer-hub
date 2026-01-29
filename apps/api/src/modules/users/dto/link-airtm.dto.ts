import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO for linking a user's Airtm account.
 */
export class LinkAirtmDto {
    /**
     * Email address to verify against Airtm.
     * Must match the email registered in the Airtm platform.
     */
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

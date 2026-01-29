import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';

/**
 * User types supported by the platform.
 */
export enum UserType {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    BOTH = 'BOTH',
}

/**
 * DTO for creating a new user.
 */
export class CreateUserDto {
    /**
     * External user ID from the marketplace.
     * This is the marketplace's internal user identifier.
     */
    @IsString()
    @IsNotEmpty()
    externalUserId!: string;

    /**
     * User's email address (optional).
     */
    @IsEmail()
    @IsOptional()
    email?: string;

    /**
     * User type (BUYER, SELLER, or BOTH).
     * Defaults to BOTH if not specified.
     */
    @IsEnum(UserType)
    @IsOptional()
    type?: UserType = UserType.BOTH;
}

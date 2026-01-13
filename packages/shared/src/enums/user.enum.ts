/**
 * User Status Enum
 * @see docs/api/endpoints/users.md
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/**
 * User Type Enum
 */
export enum UserType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  BOTH = 'BOTH',
}

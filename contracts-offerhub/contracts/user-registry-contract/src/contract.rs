use crate::access::AccessControl;
use crate::events::*;
use crate::storage::*;
use crate::types::{
    require_auth, AllUsersExport, ContractExportResult, Error, PlatformDataExport,
    PublicationStatus, UserDataExport, UserProfile, UserStatus, VerificationLevel, UserProfileSummary,
};
use crate::validation::{
    validate_bulk_verification, validate_metadata_update, validate_user_verification,
};
use soroban_sdk::{Address, Env, IntoVal, String, Symbol, Vec};

pub struct UserRegistryContract;

impl UserRegistryContract {
    // ==================== INITIALIZATION ====================

    /// Initialize the contract with an admin
    pub fn initialize_admin(env: Env, admin: Address) -> Result<(), Error> {
        let result = AccessControl::initialize_admin(&env, admin.clone())?;
        emit_admin_initialized(&env, &admin);
        Ok(result)
    }

    // ==================== LEGACY FUNCTIONS (for backward compatibility) ====================

    /// Legacy function for registering a verified user (basic level)
    pub fn register_verified_user(env: Env, user: Address) -> Result<(), Error> {
        require_auth(&env, &user)?;
        // Rate limit: max 3 registrations per 24h per caller
        let limit_type = String::from_str(&env, "register_user");
        check_rate_limit(&env, &user, &limit_type, 3, 24 * 3600)?;

        // Check if user is blacklisted
        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        let mut users = get_verified_users(&env);
        if users.contains_key(user.clone()) {
            return Err(Error::AlreadyRegistered);
        }

        // Add to legacy storage
        users.set(user.clone(), true);
        set_verified_users(&env, &users);

        // Add to new profile storage with basic verification
        let profile = create_default_profile(&env, VerificationLevel::Basic, 0); // No expiration
        set_user_profile(&env, &user, &profile);

        let count = Self::increment_user_count(&env)?;

        emit_total_users(&env, &user, &count);
        emit_user_registered(&env, &user);
        emit_user_verified(&env, &user, &VerificationLevel::Basic, 0);
        Ok(())
    }

    /// Legacy function to check if user is verified
    pub fn is_verified(env: Env, user: Address) -> bool {
        // Check new profile system first
        if let Some(profile) = get_user_profile(&env, &user) {
            return !profile.is_blacklisted && Self::is_verification_valid(&env, &profile);
        }

        // Fall back to legacy system
        let users = get_verified_users(&env);
        users.get(user.clone()).unwrap_or(false) && !is_blacklisted(&env, &user)
    }

    // ==================== ENHANCED USER VERIFICATION ====================

    /// Verify a user with a specific level and optional expiration (admin/moderator only)
    pub fn verify_user(
        env: Env,
        admin: Address,
        user: Address,
        level: VerificationLevel,
        expires_at: u64, // 0 means no expiration
        metadata: String,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        // Input validation
        validate_user_verification(&env, &admin, &user, &level, expires_at, &metadata)?;

        // Check if user is blacklisted
        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        let profile = UserProfile {
            verification_level: level.clone(),
            verified_at: env.ledger().timestamp(),
            expires_at,
            metadata,
            is_blacklisted: false,
            publication_status: PublicationStatus::Private,
            validations: Vec::new(&env),
        };

        set_user_profile(&env, &user, &profile);

        let count = Self::increment_user_count(&env)?;
        // Update legacy storage for backward compatibility
        let mut users = get_verified_users(&env);
        users.set(user.clone(), true);
        set_verified_users(&env, &users);

        emit_total_users(&env, &user, &count);
        emit_user_verified(&env, &user, &level, expires_at);
        Ok(())
    }

    /// Unverify a user (admin/moderator only)
    pub fn unverify_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        let _profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;

        remove_user_profile(&env, &user);

        // Update legacy storage
        let mut users = get_verified_users(&env);
        users.remove(user.clone());
        set_verified_users(&env, &users);

        emit_user_unverified(&env, &user);
        Ok(())
    }

    /// Update verification level (admin/moderator only)
    pub fn update_verification_level(
        env: Env,
        admin: Address,
        user: Address,
        new_level: VerificationLevel,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        let old_level = profile.verification_level.clone();

        profile.verification_level = new_level.clone();
        set_user_profile(&env, &user, &profile);

        emit_verification_level_updated(&env, &user, &old_level, &new_level);
        Ok(())
    }

    /// Renew verification (extend expiration) (admin/moderator only)
    pub fn renew_verification(
        env: Env,
        admin: Address,
        user: Address,
        new_expires_at: u64,
    ) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        profile.expires_at = new_expires_at;
        set_user_profile(&env, &user, &profile);

        emit_verification_renewed(&env, &user, new_expires_at);
        Ok(())
    }

    // ==================== BLACKLIST FUNCTIONALITY ====================

    /// Add user to blacklist (admin/moderator only)
    pub fn blacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        // Prevent blacklisting admin or moderators
        if let Some(current_admin) = AccessControl::get_current_admin(&env) {
            if current_admin == user {
                return Err(Error::CannotBlacklistAdmin);
            }
        }

        let moderators = AccessControl::get_all_moderators(&env);
        if moderators.contains(&user) {
            return Err(Error::CannotBlacklistModerator);
        }

        if is_blacklisted(&env, &user) {
            return Err(Error::AlreadyBlacklisted);
        }

        add_to_blacklist(&env, &user);

        // Update user profile if exists
        if let Some(mut profile) = get_user_profile(&env, &user) {
            profile.is_blacklisted = true;
            set_user_profile(&env, &user, &profile);
        }

        emit_user_blacklisted(&env, &user, &admin);
        Ok(())
    }

    /// Remove user from blacklist (admin/moderator only)
    pub fn unblacklist_user(env: Env, admin: Address, user: Address) -> Result<(), Error> {
        AccessControl::require_admin_or_moderator(&env, &admin)?;

        if !is_blacklisted(&env, &user) {
            return Err(Error::NotBlacklisted);
        }

        remove_from_blacklist(&env, &user);

        // Update user profile if exists
        if let Some(mut profile) = get_user_profile(&env, &user) {
            profile.is_blacklisted = false;
            set_user_profile(&env, &user, &profile);
        }

        emit_user_unblacklisted(&env, &user, &admin);
        Ok(())
    }

    /// Check if user is blacklisted
    pub fn is_user_blacklisted(env: Env, user: Address) -> bool {
        is_blacklisted(&env, &user)
    }

    // ==================== BULK OPERATIONS ====================

    /// Bulk verify users (admin only)
    pub fn bulk_verify_users(
        env: Env,
        admin: Address,
        users: Vec<Address>,
        level: VerificationLevel,
        expires_at: u64,
        metadata: String,
    ) -> Result<(), Error> {
        AccessControl::require_admin(&env, &admin)?;

        // Input validation
        validate_bulk_verification(&env, &admin, &users, &level, expires_at, &metadata)?;

        let mut verified_count = 0u32;

        for i in 0..users.len() {
            let user = users.get(i).unwrap();

            // Skip blacklisted users
            if is_blacklisted(&env, &user) {
                continue;
            }

            let profile = UserProfile {
                verification_level: level.clone(),
                verified_at: env.ledger().timestamp(),
                expires_at,
                metadata: metadata.clone(),
                is_blacklisted: false,
                publication_status: PublicationStatus::Private,
                validations: Vec::new(&env),
            };

            set_user_profile(&env, &user, &profile);

            // Update legacy storage
            let mut legacy_users = get_verified_users(&env);
            legacy_users.set(user.clone(), true);
            set_verified_users(&env, &legacy_users);

            let count = Self::increment_user_count(&env)?;

            emit_total_users(&env, &user, &count);
            emit_user_verified(&env, &user, &level, expires_at);
            verified_count += 1;
        }

        emit_bulk_verification_completed(&env, verified_count);
        Ok(())
    }

    // ==================== USER PROFILE METADATA ====================

    /// Update user metadata (user themselves or admin/moderator)
    pub fn update_user_metadata(
        env: Env,
        caller: Address,
        user: Address,
        metadata: String,
    ) -> Result<(), Error> {
        // Input validation
        validate_metadata_update(&env, &caller, &user, &metadata)?;

        // User can update their own metadata, or admin/moderator can update any user's metadata
        if caller != user {
            AccessControl::require_admin_or_moderator(&env, &caller)?;
        } else {
            require_auth(&env, &caller)?;
        }

        let mut profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;
        profile.metadata = metadata;
        set_user_profile(&env, &user, &profile);

        emit_metadata_updated(&env, &user);
        Ok(())
    }

    // ==================== STATUS CHECKING ====================

    /// Get comprehensive user status
    pub fn get_user_status(env: Env, user: Address) -> UserStatus {
        if let Some(profile) = get_user_profile(&env, &user) {
            let is_expired = Self::is_verification_expired(&env, &profile);
            UserStatus {
                is_verified: !profile.is_blacklisted && !is_expired,
                verification_level: profile.verification_level,
                is_blacklisted: profile.is_blacklisted,
                verification_expires_at: profile.expires_at,
                is_expired,
                publication_status: profile.publication_status.clone(),
                validation_count: profile.validations.len() as u32,
            }
        } else {
            // Check legacy system
            let users = get_verified_users(&env);
            let is_verified_legacy = users.get(user.clone()).unwrap_or(false);
            let is_blacklisted_current = is_blacklisted(&env, &user);

            UserStatus {
                is_verified: is_verified_legacy && !is_blacklisted_current,
                verification_level: if is_verified_legacy {
                    VerificationLevel::Basic
                } else {
                    VerificationLevel::Basic
                },
                is_blacklisted: is_blacklisted_current,
                verification_expires_at: 0, // Legacy users don't have expiration
                is_expired: false,
                publication_status: PublicationStatus::Private,
                validation_count: 0,
            }
        }
    }

    /// Get user profile
    pub fn get_user_profile_data(env: Env, user: Address) -> Option<UserProfile> {
        get_user_profile(&env, &user)
    }

    /// Check verification level
    pub fn get_verification_level(env: Env, user: Address) -> Option<VerificationLevel> {
        get_user_profile(&env, &user).map(|p| p.verification_level)
    }

    // ==================== ACCESS CONTROL ====================

    /// Add moderator (admin only)
    pub fn add_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        AccessControl::add_moderator(&env, admin.clone(), moderator.clone())?;
        emit_moderator_added(&env, &moderator, &admin);
        Ok(())
    }

    /// Remove moderator (admin only)
    pub fn remove_moderator(env: Env, admin: Address, moderator: Address) -> Result<(), Error> {
        AccessControl::remove_moderator(&env, admin.clone(), moderator.clone())?;
        emit_moderator_removed(&env, &moderator, &admin);
        Ok(())
    }

    /// Transfer admin role (current admin only)
    pub fn transfer_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), Error> {
        AccessControl::transfer_admin(&env, current_admin.clone(), new_admin.clone())?;
        emit_admin_transferred(&env, &current_admin, &new_admin);
        Ok(())
    }

    /// Get current admin
    pub fn get_admin(env: Env) -> Option<Address> {
        AccessControl::get_current_admin(&env)
    }

    /// Get all moderators
    pub fn get_moderators(env: Env) -> Vec<Address> {
        AccessControl::get_all_moderators(&env)
    }

    // ==================== CONTRACT MANAGEMENT ====================

    /// Set rating contract address (admin only)
    pub fn set_rating_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        AccessControl::require_admin(&env, &admin)?;
        set_rating_contract(&env, &contract_address);
        Ok(())
    }

    /// Add escrow contract address (admin only)
    pub fn add_escrow_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        AccessControl::require_admin(&env, &admin)?;
        add_escrow_contract(&env, &contract_address);
        Ok(())
    }

    /// Add dispute contract address (admin only)
    pub fn add_dispute_contract(
        env: Env,
        admin: Address,
        contract_address: Address,
    ) -> Result<(), Error> {
        AccessControl::require_admin(&env, &admin)?;
        add_dispute_contract(&env, &contract_address);
        Ok(())
    }

    // ===== Rate limiting admin helpers =====
    pub fn set_rate_limit_bypass(
        env: Env,
        admin: Address,
        user: Address,
        bypass: bool,
    ) -> Result<(), Error> {
        set_rate_limit_bypass(&env, &admin, &user, bypass)
    }

    pub fn reset_rate_limit(
        env: Env,
        admin: Address,
        user: Address,
        limit_type: String,
    ) -> Result<(), Error> {
        // Only admin
        AccessControl::require_admin(&env, &admin)?;
        reset_rate_limit(&env, &user, &limit_type);
        Ok(())
    }

    // ==================== DATA EXPORT FUNCTIONS ====================

    /// Export user data (user themselves or admin/moderator)
    pub fn export_user_data(
        env: Env,
        caller: Address,
        user: Address,
    ) -> Result<UserDataExport, Error> {
        // Permission check: user can export their own data, or admin/moderator can export any user's data
        if caller != user {
            AccessControl::require_admin_or_moderator(&env, &caller)?;
        } else {
            require_auth(&env, &caller)?;
        }

        let profile_option = get_user_profile(&env, &user);
        let status = Self::get_user_status(env.clone(), user.clone());

        // Use actual profile or create a default one
        let (has_profile, profile) = match profile_option {
            Some(p) => (true, p),
            None => (
                false,
                create_default_profile(&env, VerificationLevel::Basic, 0),
            ),
        };

        let export_data = UserDataExport {
            user_address: user,
            has_profile,
            profile,
            status,
            export_timestamp: env.ledger().timestamp(),
            export_version: String::from_str(&env, "1.0"),
        };

        Ok(export_data)
    }

    /// Helper function to export all users data without auth check
    fn export_all_data_internal(
        env: &Env,
        admin: &Address,
        limit: u32,
    ) -> Result<AllUsersExport, Error> {
        // Apply data size limit to prevent gas issues (max 100 users per export)
        let max_limit = 100u32;
        let actual_limit = if limit == 0 || limit > max_limit {
            max_limit
        } else {
            limit
        };

        let verified_users = get_verified_users(env);
        let blacklisted_users = get_blacklisted_users(env);

        let mut verified_addresses = Vec::new(env);
        let mut blacklisted_addresses = Vec::new(env);
        let mut data_size_limit_reached = false;

        // Export verified users (limited)
        let mut count = 0u32;
        for (address, _) in verified_users.iter() {
            if count >= actual_limit {
                data_size_limit_reached = true;
                break;
            }
            verified_addresses.push_back(address);
            count += 1;
        }

        // Export blacklisted users (limited)
        count = 0u32;
        for address in blacklisted_users.iter() {
            if count >= actual_limit {
                data_size_limit_reached = true;
                break;
            }
            blacklisted_addresses.push_back(address);
            count += 1;
        }

        let total_users = Self::get_total_users(env)?;

        let export_data = AllUsersExport {
            total_users,
            verified_users: verified_addresses,
            blacklisted_users: blacklisted_addresses,
            export_timestamp: env.ledger().timestamp(),
            export_version: String::from_str(env, "1.0"),
            data_size_limit_reached,
        };

        // Emit export event
        emit_data_exported(env, admin, String::from_str(env, "all_users"));

        Ok(export_data)
    }

    /// Export all users data (admin only)
    pub fn export_all_data(env: Env, admin: Address, limit: u32) -> Result<AllUsersExport, Error> {
        AccessControl::require_admin(&env, &admin)?;
        Self::export_all_data_internal(&env, &admin, limit)
    }

    /// Export all platform data (admin only) - comprehensive export across all contract types
    pub fn export_platform_data(
        env: Env,
        admin: Address,
        limit: u32,
    ) -> Result<PlatformDataExport, Error> {
        AccessControl::require_admin(&env, &admin)?;

        // Apply data size limit to prevent gas issues
        let max_limit = 50u32;
        let actual_limit = if limit == 0 || limit > max_limit {
            max_limit
        } else {
            limit
        };

        // Export user registry data first
        let user_registry_summary = Self::export_all_data_internal(&env, &admin, actual_limit)?;

        let mut total_contracts_processed = 1u32; // User registry
        let mut successful_exports = 1u32; // User registry successful
        let mut failed_exports = 0u32;

        // Export rating contract data
        let mut rating_contract_results = Vec::new(&env);
        if let Some(rating_contract_addr) = get_rating_contract(&env) {
            let result = Self::call_rating_contract_export(&env, &rating_contract_addr, &admin);
            let export_result = ContractExportResult {
                contract_address: rating_contract_addr,
                contract_type: String::from_str(&env, "rating"),
                export_successful: result.is_ok(),
                data_size: if result.is_ok() { 1 } else { 0 },
                error_message: if result.is_err() {
                    Some(String::from_str(&env, "Export failed"))
                } else {
                    None
                },
            };

            if result.is_ok() {
                successful_exports += 1;
            } else {
                failed_exports += 1;
            }
            total_contracts_processed += 1;
            rating_contract_results.push_back(export_result);
        }

        // Export escrow contracts data
        let mut escrow_contract_results = Vec::new(&env);
        let escrow_contracts = get_escrow_contracts(&env);
        let mut escrow_count = 0u32;

        for i in 0..escrow_contracts.len() {
            if escrow_count >= actual_limit {
                break; // Respect data size limits
            }

            if let Some(escrow_addr) = escrow_contracts.get(i) {
                let contract_id = String::from_str(&env, "escrow_contract");
                let result =
                    Self::call_escrow_contract_export(&env, &escrow_addr, &admin, &contract_id);

                let export_result = ContractExportResult {
                    contract_address: escrow_addr,
                    contract_type: String::from_str(&env, "escrow"),
                    export_successful: result.is_ok(),
                    data_size: if result.is_ok() { 1 } else { 0 },
                    error_message: if result.is_err() {
                        Some(String::from_str(&env, "Export failed"))
                    } else {
                        None
                    },
                };

                if result.is_ok() {
                    successful_exports += 1;
                } else {
                    failed_exports += 1;
                }
                total_contracts_processed += 1;
                escrow_contract_results.push_back(export_result);
                escrow_count += 1;
            }
        }

        // Export dispute contracts data
        let mut dispute_contract_results = Vec::new(&env);
        let dispute_contracts = get_dispute_contracts(&env);
        let mut dispute_count = 0u32;

        for i in 0..dispute_contracts.len() {
            if dispute_count >= actual_limit {
                break; // Respect data size limits
            }

            if let Some(dispute_addr) = dispute_contracts.get(i) {
                let result =
                    Self::call_dispute_contract_export(&env, &dispute_addr, &admin, actual_limit);

                let export_result = ContractExportResult {
                    contract_address: dispute_addr,
                    contract_type: String::from_str(&env, "dispute"),
                    export_successful: result.is_ok(),
                    data_size: if result.is_ok() { 1 } else { 0 },
                    error_message: if result.is_err() {
                        Some(String::from_str(&env, "Export failed"))
                    } else {
                        None
                    },
                };

                if result.is_ok() {
                    successful_exports += 1;
                } else {
                    failed_exports += 1;
                }
                total_contracts_processed += 1;
                dispute_contract_results.push_back(export_result);
                dispute_count += 1;
            }
        }

        // Generate platform statistics
        let mut platform_statistics = Vec::new(&env);
        platform_statistics.push_back((
            String::from_str(&env, "total_users"),
            String::from_str(&env, "exported"),
        ));
        platform_statistics.push_back((
            String::from_str(&env, "contracts_processed"),
            String::from_str(&env, "multiple"),
        ));
        platform_statistics.push_back((
            String::from_str(&env, "export_status"),
            String::from_str(&env, "completed"),
        ));

        let platform_export = PlatformDataExport {
            user_registry_summary,
            rating_contract_results,
            escrow_contract_results,
            dispute_contract_results,
            total_contracts_processed,
            successful_exports,
            failed_exports,
            export_timestamp: env.ledger().timestamp(),
            export_version: String::from_str(&env, "1.0"),
            platform_statistics,
        };

        // Emit platform export event
        emit_data_exported(&env, &admin, String::from_str(&env, "platform_data"));

        Ok(platform_export)
    }

    // ==================== HELPER FUNCTIONS FOR CONTRACT CALLS ====================

    fn call_rating_contract_export(
        env: &Env,
        contract_address: &Address,
        admin: &Address,
    ) -> Result<(), Error> {
        let result: Result<(), soroban_sdk::InvokeError> = env.invoke_contract(
            contract_address,
            &Symbol::new(env, "export_all_rating_data"),
            (admin.clone(),).into_val(env),
        );

        match result {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::UnexpectedError),
        }
    }

    fn call_escrow_contract_export(
        env: &Env,
        contract_address: &Address,
        caller: &Address,
        contract_id: &String,
    ) -> Result<(), Error> {
        let result: Result<(), soroban_sdk::InvokeError> = env.invoke_contract(
            contract_address,
            &Symbol::new(env, "export_escrow_data"),
            (caller.clone(), contract_id.clone()).into_val(env),
        );

        match result {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::UnexpectedError),
        }
    }

    fn call_dispute_contract_export(
        env: &Env,
        contract_address: &Address,
        admin: &Address,
        limit: u32,
    ) -> Result<(), Error> {
        let result: Result<(), soroban_sdk::InvokeError> = env.invoke_contract(
            contract_address,
            &Symbol::new(env, "export_all_dispute_data"),
            (admin.clone(), limit).into_val(env),
        );

        match result {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::UnexpectedError),
        }
    }

    // ==================== HELPER FUNCTIONS ====================

    fn is_verification_expired(env: &Env, profile: &UserProfile) -> bool {
        if profile.expires_at == 0 {
            return false; // No expiration
        }
        env.ledger().timestamp() > profile.expires_at
    }

    fn is_verification_valid(env: &Env, profile: &UserProfile) -> bool {
        !Self::is_verification_expired(env, profile)
    }

    // Statistcis and Metrics
    pub fn get_total_users(env: &Env) -> Result<u64, Error> {
        env.storage()
            .persistent()
            .get(&TOTAL_USERS)
            .unwrap_or(Ok(0))
    }

    pub fn set_total_users(env: &Env, count: u64) -> Result<(), Error> {
        env.storage().persistent().set(&TOTAL_USERS, &count);
        Ok(())
    }

    pub fn increment_user_count(env: &Env) -> Result<u64, Error> {
        let current_count = Self::get_total_users(env)?;
        let new_count = current_count + 1;
        Self::set_total_users(env, new_count)?;
        Ok(new_count)
    }

    pub fn get_user_profile(env: Env, user: Address) -> Result<UserProfileSummary, Error> {
        // Fetch user profile from storage
        let profile = get_user_profile(&env, &user).ok_or(Error::UserNotFound)?;

        // Format verification level
        let verification_level = match profile.verification_level {
            VerificationLevel::Basic => String::from_str(&env, "Basic"),
            VerificationLevel::Premium => String::from_str(&env, "Premium"),
            VerificationLevel::Enterprise => String::from_str(&env, "Enterprise"),
        };

        let is_expired = Self::is_verification_expired(&env, &profile);
        

        // Format publication status
        let publication_status = match profile.publication_status {
            PublicationStatus::Private => String::from_str(&env, "Private"),
            PublicationStatus::Published => String::from_str(&env, "Published"),
            PublicationStatus::Verified => String::from_str(&env, "Verified"),
        };

        // Construct formatted summary
        let summary = UserProfileSummary {
            user_address: user,
            verification_level,
            verified_at: profile.verified_at,
            expires_at: profile.expires_at,
            metadata: profile.metadata,
            is_blacklisted: profile.is_blacklisted,
            publication_status,
            is_expired,
            timestamp: env.ledger().timestamp(),
        };

        Ok(summary)
    }
}

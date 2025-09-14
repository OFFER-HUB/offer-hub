import { supabase } from '@/lib/supabase/supabase';
import { AppError, BadRequestError, ConflictError, InternalServerError } from '@/utils/AppError';
import { CreateUserDTO, User, UserFilters } from '@/types/user.types';

class UserService {
    async createUser(data: CreateUserDTO) {
    // Verify unique wallet_address
    const { data: walletUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', data.wallet_address)
        .single();

    if (walletUser) throw new ConflictError('Wallet_address_already_registered');

    // Verify unique username
    const { data: usernameUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', data.username)
        .single();

    if (usernameUser) throw new ConflictError('Username_already_taken');

    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
        wallet_address: data.wallet_address,
        username: data.username,
        name: data.name,
        bio: data.bio,
        email: data.email,
        is_freelancer: data.is_freelancer ?? false,
        }])
        .select()
        .single();

        if (insertError) throw new InternalServerError('Error_creating_user');
        
        return newUser;
    }

    async getUserById(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('id, wallet_address, username, name, bio, email, is_freelancer, created_at')
            .eq('id', id)
            .single();

        if (error) return null;

        return data;
    }

    async updateUser(id: string, updates: Partial<CreateUserDTO>) {
        // Do not allow changes to wallet_address or is_freelancer
        if ('wallet_address' in updates || 'is_freelancer' in updates) {
        throw new BadRequestError('Cannot_update_restricted_fields');
        }

        // Validate unique username
        if (updates.username) {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', updates.username)
            .neq('id', id)
            .single();

        if (existing) throw new ConflictError('Username_already_taken');
        }

        const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

        if (error) throw new InternalServerError('Error_updating_user');
        return data;
    }

    async getAllUsers(filters: UserFilters): Promise<{ users: User[]; total: number }> {
        const {
            page = 1,
            limit = 20,
            search,
            is_freelancer
        } = filters;

        let query = supabase
            .from('users')
            .select(
                `
                id,
                wallet_address,
                username,
                name,
                bio,
                email,
                is_freelancer,
                created_at
                `,
                { count: 'exact' }
            );

        // Apply search filter
        if (search) {
            query = query.or(
                `name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`
            );
        }

        // Apply role filter
        if (is_freelancer !== undefined) {
            query = query.eq('is_freelancer', is_freelancer);
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Order by creation date (newest first)
        query = query.order('created_at', { ascending: false });

        const { data: users, error, count } = await query;

        if (error) {
            throw new InternalServerError(`Failed to fetch users: ${error.message}`);
        }

        return {
            users: users || [],
            total: count || 0
        };
    }
}

export const userService = new UserService();
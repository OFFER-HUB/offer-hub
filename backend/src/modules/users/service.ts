import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { SearchService } from "../search/search.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly searchService: SearchService
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingWallet = await this.usersRepository.findOne({
      where: { wallet_address: createUserDto.wallet_address },
    });
    if (existingWallet)
      throw new ConflictException(
        `User with wallet address ${createUserDto.wallet_address} already exists`
      );

    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Index the user in Elasticsearch
    await this.searchService.indexUser(savedUser);

    return savedUser;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername)
        throw new ConflictException(
          `Username ${updateUserDto.username} is already taken`
        );
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail)
        throw new ConflictException(
          `Email ${updateUserDto.email} is already registered`
        );
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Update the user in Elasticsearch
    await this.searchService.updateUser(userId, updatedUser);

    return updatedUser;
  }

  async remove(userId: string): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${userId} not found`);

    // Delete the user from Elasticsearch
    await this.searchService.deleteUser(userId);
  }
}

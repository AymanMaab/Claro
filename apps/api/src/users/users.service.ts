import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    )   {}

    async findById(id: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);
        if (dto.firstName) user.firstName = dto.firstName;
        if (dto.lastName)  user.lastName  = dto.lastName;
        if (dto.email)     user.email     = dto.email;
        if (dto.password)  user.password  = await bcrypt.hash(dto.password, 12);
        return this.userRepo.save(user);
    }

    async remove(id: string): Promise<void> {
        await this.findById(id);
        await this.userRepo.delete(id);
    }
}
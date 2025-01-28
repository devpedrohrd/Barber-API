import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { Roles } from 'src/auth/dto/roles'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Role } from 'src/decorators/roles'

import { SearchUserFilter } from './dto/filterUserDTO'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Role(Roles.ADMIN)
  async findAll() {
    return this.userService.findAll()
  }

  @Get('searchUser')
  async searchUser(@Query() filter: SearchUserFilter) {
    return this.userService.searchUser(filter)
  }

  @Get(':id')
  @Role(Roles.ADMIN, Roles.BARBER)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  @Role(Roles.ADMIN, Roles.BARBER)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.update(id, updateUserDto, req.user)
  }

  @Delete(':id')
  @Role(Roles.ADMIN)
  async remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}

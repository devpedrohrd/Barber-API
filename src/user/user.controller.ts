import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from 'src/auth/dto/roles'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Role } from 'src/decorators/roles'

import { SearchUserFilter } from './dto/filterUserDTO'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import { CacheInterceptor } from 'src/interceptor/cache/cache.interceptor'

@ApiTags('users') // Agrupa no Swagger
@ApiBearerAuth() // Indica que é necessário um token JWT para acessar esses endpoints
@Controller('users')
@UseGuards(JwtAuthGuard) // Protege todas as rotas com autenticação JWT
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Role(Roles.ADMIN)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obter todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [User] })
  async findAll() {
    return this.userService.findAll()
  }

  @Get('searchUser')
  @ApiOperation({ summary: 'Buscar usuários por filtro' })
  @ApiResponse({ status: 200, description: 'Usuários filtrados', type: [User] })
  async searchUser(@Query() filter: SearchUserFilter) {
    return this.userService.searchUser(filter)
  }

  @Get(':id')
  @Role(Roles.ADMIN, Roles.BARBER)
  @ApiOperation({ summary: 'Obter um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  @Role(Roles.ADMIN, Roles.BARBER)
  @ApiOperation({ summary: 'Atualizar informações do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.update(id, updateUserDto, req.user)
  }

  @Delete(':id')
  @Role(Roles.ADMIN)
  @ApiOperation({ summary: 'Remover um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}

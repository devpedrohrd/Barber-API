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

import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { SearchAppointmentFilter } from './dto/filterAppointment'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto)
  }

  @Get()
  @Role(Roles.ADMIN)
  async findAll() {
    return this.appointmentService.findAll()
  }

  @Get('searchAppointment')
  @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
  async searchAppointment(
    @Query() filter: SearchAppointmentFilter,
    @Req() req: Request,
  ) {
    return this.appointmentService.searchAppointment(filter, req.user)
  }

  @Get(':id')
  @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id)
  }

  @Patch(':id')
  @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: Request,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto, req.user)
  }

  @Delete(':id')
  @Role(Roles.ADMIN, Roles.BARBER)
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentService.remove(id, req.user)
  }
}

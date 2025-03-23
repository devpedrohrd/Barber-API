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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger' // Import Swagger decorators

import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { SearchAppointmentFilter } from './dto/filterAppointment'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { BarberScheduleDTO, DateAvailibility } from './entities/schedule.entity'
import { Appointment } from '../appointment/entities/appointment.entity' // Import the Appointment schema

@Controller('appointments')
@ApiTags('Appointments') // Tag for grouping related endpoints in Swagger
@ApiBearerAuth() // Add this if JWT authentication is used
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('barberSchedule/:id')
  @ApiOperation({ summary: 'Create a barber schedule' }) // Operation summary
  @ApiParam({ name: 'id', description: 'ID of the barber' }) // Parameter description
  @ApiBody({ type: BarberScheduleDTO }) // Request body type
  @ApiCreatedResponse({ description: 'Barber schedule created successfully' }) // Success response
  @Role(Roles.BARBER, Roles.ADMIN)
  async createBarberSchedule(
    @Param('id') id: string,
    @Body() createBarberScheduleDto: BarberScheduleDTO,
  ) {
    return this.appointmentService.createBarberSchedule(
      id,
      createBarberScheduleDto,
    )
  }

  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiCreatedResponse({
    description: 'Appointment created successfully',
    type: Appointment,
  }) // Specify response type
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiOkResponse({
    description: 'List of all appointments',
    type: [Appointment],
  }) // Use array for multiple results
  @Role(Roles.ADMIN)
  async findAll() {
    return this.appointmentService.findAll()
  }

    @Get('searchAppointment')
    @ApiOperation({ summary: 'Search appointments' })
    @ApiQuery({ name: 'filter', description: 'Search filter' }) // Query parameters
    @ApiOkResponse({
      description: 'List of matching appointments',
      type: [Appointment],
    })
    @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
    async searchAppointment(
      @Query() filter: SearchAppointmentFilter,
      @Req() req: Request,
    ) {
      return this.appointmentService.searchAppointment(filter, req.user)
    }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiParam({ name: 'id', description: 'ID of the appointment' })
  @ApiOkResponse({ description: 'Appointment details', type: Appointment })
  @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', description: 'ID of the appointment' })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiOkResponse({
    description: 'Appointment updated successfully',
    type: Appointment,
  })
  @Role(Roles.ADMIN, Roles.BARBER, Roles.CLIENT)
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: Request,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto, req.user);
  }

  @Get('barberSchedule/:id')
  @ApiOperation({ summary: 'Get barber schedule' })
  @ApiParam({ name: 'id', description: 'ID of the barber' })
  @ApiOkResponse({ description: 'Barber schedule' }) // Consider a specific DTO for schedule data
  @Role(Roles.BARBER, Roles.ADMIN, Roles.CLIENT)
  async getBarberSchedule(@Param('id') id: string) {
    return this.appointmentService.getScheduleBarber(id)
  }

  @Patch('addDateBarberSchedule/:id')
  @ApiOperation({ summary: 'Update barber schedule' })
  @ApiParam({ name: 'id', description: 'ID of the barber' })
  @ApiBody({ type: BarberScheduleDTO })
  @ApiOkResponse({ description: 'Barber schedule updated successfully' })
  @Role(Roles.BARBER, Roles.ADMIN)
  async addDateBarberSchedule(
    @Param('id') id: string,
    @Body() updateBarberScheduleDto: DateAvailibility,
    @Req() req: Request,
  ) {
    return this.appointmentService.addBarberSchedule(
      updateBarberScheduleDto,
      id,
      req['user'],
    )
  }

  @Patch('removeDateBarberSchedule/:id')
  @ApiOperation({ summary: 'Update barber schedule' })
  @ApiParam({ name: 'id', description: 'ID of the barber' })
  @ApiBody({ type: BarberScheduleDTO })
  @ApiOkResponse({ description: 'Barber schedule updated successfully' })
  @Role(Roles.BARBER, Roles.ADMIN)
  async removeDateBarberSchedule(
    @Param('id') id: string,
    @Body() updateBarberScheduleDto: DateAvailibility,
    @Req() req: Request,
  ) {
    return this.appointmentService.removeBarberSchedule(
      updateBarberScheduleDto,
      id,
      req['user'],
    )
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiParam({ name: 'id', description: 'ID of the appointment' })
  @ApiOkResponse({ description: 'Appointment deleted successfully' })
  @Role(Roles.ADMIN, Roles.BARBER)
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentService.remove(id, req.user)
  }

  @Delete('deleteBarberSchedule/:id')
  @ApiOperation({ summary: 'Delete barber schedule' })
  @ApiParam({ name: 'id', description: 'ID of the barber' })
  @ApiOkResponse({ description: 'Barber schedule deleted successfully' })
  @Role(Roles.ADMIN, Roles.BARBER)
  async removeBarberSchedule(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentService.deleteBarberSchedule(id, req)
  }
}

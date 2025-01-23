import { BarberService } from './barber.service'
import { CreateBarberDto } from './dto/create-barber.dto'
import { UpdateBarberDto } from './dto/update-barber.dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'

@Controller('barber')
export class BarberController {
  constructor(private readonly barberService: BarberService) {}

  @Post()
  async create(@Body() createBarberDto: CreateBarberDto) {
    return this.barberService.create(createBarberDto)
  }

  @Get()
  async findAll() {
    return this.barberService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.barberService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBarberDto: UpdateBarberDto,
  ) {
    return this.barberService.update(id, updateBarberDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.barberService.remove(id)
  }
}

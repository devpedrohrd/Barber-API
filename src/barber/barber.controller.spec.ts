import { Test, TestingModule } from '@nestjs/testing'
import { BarberController } from './barber.controller'
import { BarberService } from './barber.service'

describe('BarberController', () => {
  let controller: BarberController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarberController],
      providers: [BarberService],
    }).compile()

    controller = module.get<BarberController>(BarberController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

import { BarberService } from './barber.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('BarberService', () => {
  let service: BarberService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarberService],
    }).compile()

    service = module.get<BarberService>(BarberService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

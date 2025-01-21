import { AppointmentDocument } from '../entities/appointment.entity'

export type SearchAppointmentFilter = Pick<
  AppointmentDocument,
  'id' | 'date' | 'costumer' | 'barberId' | 'status' | 'service' | 'isPaid'
>

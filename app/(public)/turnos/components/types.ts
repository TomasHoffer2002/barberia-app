export type PublicBarber = {
  id:        string
  name:      string
  instagram: string | null
  avatar_url: string | null
}

export type PublicService = {
  id:          string
  name:        string
  duration_min: number
  price:       number | null
  barber_id:   string
}

export type BookingState = {
  barberId:    string | null
  barberName:  string | null
  serviceId:   string | null
  serviceName: string | null
  duration:    number | null
  date:        string | null
  time:        string | null
  name:        string
  phone:       string
  instagram:   string
}
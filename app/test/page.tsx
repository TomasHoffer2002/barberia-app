import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data: barbers, error } = await supabase.from('barbers').select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Conexión OK</h1>
      <p>Barberos en la base: {barbers.length}</p>
      <pre>{JSON.stringify(barbers, null, 2)}</pre>
    </div>
  )
}
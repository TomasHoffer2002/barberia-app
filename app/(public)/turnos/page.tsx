import { getPublicInitialDataAction } from './actions'
import TurnosClient from './TurnosClient'

export default async function TurnosPage() {
  const data = await getPublicInitialDataAction()
  return <TurnosClient {...data} />
}
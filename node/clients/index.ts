import { IOClients, VBase } from '@vtex/api'
import { MasterDataClient } from './masterDataClient'

export class Clients extends IOClients {
  public get masterData() {
    return this.getOrSet('masterData', MasterDataClient)
  }

  public get vbase() {
    return this.getOrSet('vbase', VBase)
  }
}

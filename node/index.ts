import {
  ClientsConfig,
  LRUCache,
  RecorderState,
  Service,
  ServiceContext,
} from '@vtex/api'

import { Clients } from './clients'
import { Mutation } from './resolvers/mutation'
import { Query } from './resolvers/query'

const TREE_SECONDS_MS = 3 * 1000
const CONCURRENCY = 10

const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TREE_SECONDS_MS,
    },
    status: {
      memoryCache,
      concurrency: CONCURRENCY,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    code: number
  }
}

export default new Service<Clients, State, ServiceContext>({
  clients,
  graphql: {
    resolvers: {
      Query,
      Mutation,
    },
  },
})

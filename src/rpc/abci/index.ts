import { Comet38Client } from '@cosmjs/tendermint-rpc'
import { QueryClient } from '@cosmjs/stargate'
import { PageRequest } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination'
import {
  QueryProposalsRequest,
  QueryProposalsResponse,
} from 'cosmjs-types/cosmos/gov/v1beta1/query'

export async function queryProposals(
  tmClient: Comet38Client,
  page: number,
  perPage: number
): Promise<QueryProposalsResponse> {
  const queryClient = new QueryClient(tmClient)
  const proposalsRequest = QueryProposalsRequest.fromPartial({
    pagination: PageRequest.fromJSON({
      offset: page * perPage,
      limit: perPage,
      countTotal: true,
      reverse: true,
    }),
  })
  const req = QueryProposalsRequest.encode(proposalsRequest).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.gov.v1beta1.Query/Proposals',
    req
  )
  return QueryProposalsResponse.decode(value)
}

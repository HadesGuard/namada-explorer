import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  useColorModeValue,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { convertVotingPower } from '@/utils/helper'
import {
  fetchLastBlock,
  fetchValidatorCommitSignatures,
  fetchValidatorUptime,
  fetchValidators,
} from '@/apis'

type ValidatorData = {
  validator: string
  uptime: number
  votingPower: string
  commission: string
  commitSignatures: number
}

const columnHelper = createColumnHelper<ValidatorData>()

const columns = [
  columnHelper.accessor('validator', {
    cell: (info) => info.getValue(),
    header: 'Validator',
    meta: {
      style: { textAlign: 'center' },
    },
  }),
  columnHelper.accessor('uptime', {
    cell: (info) => info.getValue(),
    header: 'Up Time',
    meta: {
      style: { textAlign: 'center' },
    },
  }),
  columnHelper.accessor('votingPower', {
    cell: (info) => info.getValue(),
    header: 'Voting Power',
    meta: {
      isNumeric: true,
      style: { textAlign: 'center' },
    },
  }),
  columnHelper.accessor('commitSignatures', {
    cell: (info) => info.getValue(),
    header: 'Commit Signatures',
    meta: {
      isNumeric: true,
      style: { textAlign: 'center' },
    },
  }),
  columnHelper.accessor('commission', {
    cell: (info) => info.getValue(),
    header: 'Commission',
    meta: {
      isNumeric: true,
      style: { textAlign: 'center' },
    },
  }),
]

export default function Validators() {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const controller = new AbortController()

    fetchValidators(page + 1, perPage, { signal: controller.signal })
      .then(async (response: any) => {
        const { validators, total } = response
        setTotal(total)
        const lastedBlock = await fetchLastBlock().then((data) => {
          return data.header.height
        })

        // Set initial data with loading state
        const initialData = validators.map((val: any) => ({
          validator: val.address,
          uptime: 'Loading...',
          votingPower: convertVotingPower(val.voting_power),
          commission: '5',
          commitSignatures: 'Loading...',
        }))
        setData(initialData)

        // Fetch actual data
        const promises = validators.map((val: any, index: number) => {
          const uptimePromise = fetchValidatorUptime(
            val.address,
            0,
            lastedBlock
          )
            .then((data) => (data.uptime * 100).toFixed(2) + '%')
            .catch(() => 'Loading...')

          const commitSignaturesPromise = fetchValidatorCommitSignatures(
            val.address
          )
            .then((data) => data)
            .catch(() => 'Loading...')

          return Promise.all([uptimePromise, commitSignaturesPromise]).then(
            ([uptime, commitSignatures]) => {
              setData((prevData) =>
                prevData.map((item, idx) =>
                  idx === index
                    ? {
                        validator: val.address,
                        uptime: parseFloat(uptime),
                        votingPower: convertVotingPower(val.voting_power),
                        commission: '5',
                        commitSignatures,
                      }
                    : item
                )
              )
            }
          )
        })

        await Promise.all(promises)
        setIsLoading(false)
      })
      .catch((e) => {
        // Ignore errors caused by aborting the fetch request
        if (e.name === 'AbortError') {
          return
        }
      })

    return () => {
      // Abort the fetch request when a new one is made
      controller.abort()
    }
  }, [page, perPage])

  const onChangePagination = (value: {
    pageIndex: number
    pageSize: number
  }) => {
    setPage(value.pageIndex)
    setPerPage(value.pageSize)
  }

  return (
    <>
      <Head>
        <title>Blocks | Namada Explorer</title>
        <meta name="description" content="Blocks | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Validators</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon
              fontSize="16"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Validators</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <DataTable
            columns={columns}
            data={data}
            total={total}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        </Box>
      </main>
    </>
  )
}

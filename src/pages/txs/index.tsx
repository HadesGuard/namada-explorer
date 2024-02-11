import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { TxEvent } from '@cosmjs/tendermint-rpc'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  useColorModeValue,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tabs,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome, FiCheck } from 'react-icons/fi'
import { selectTxEvent } from '@/store/streamSlice'
import { toHex } from '@cosmjs/encoding'
import { timeFromNow, trimHash } from '@/utils/helper'
import { fetchBlockByHash, fetchTransactions } from '@/apis'

const MAX_ROWS = 20

type TxData = {
  height: number
  hash: string
  message: string
  time: string
  result: string
}

export default function Transactions() {
  const txEvent = useSelector(selectTxEvent)

  const [txs, setTxs] = useState<TxData[]>([])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  useEffect(() => {
    fetchTransactions(1, MAX_ROWS).then(async (res) => {
      const txs = await Promise.all(
        res.data.map(async (tx: any) => {
          const block = await fetchBlockByHash(tx.block_id)
          return {
            height: block.header.height,
            hash: tx.hash,
            message: tx.tx_type,
            time: block.header.time,
            result: 'Success',
          }
        })
      ).then((txs) => {
        setTxs(txs)
      })
    })
  }, [])

  const updateTxs = async (txEvent: TxEvent) => {
    const tx = {
      height: txEvent.height,
      hash: toHex(txEvent.hash),
      message: '',
      time: new Date().toISOString(),
      result: txEvent.result.code == 0 ? 'Success' : 'Error',
    } as TxData

    if (txs.length) {
      if (
        txEvent.height >= txs[0].height &&
        toHex(txEvent.hash) != txs[0].hash
      ) {
        setTxs((prevTx) => [tx, ...prevTx.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setTxs([tx])
    }
  }

  return (
    <>
      <Head>
        <title>Transactions | Namada Explorer</title>
        <meta name="description" content="Transactions | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Transactions</Heading>
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
          <Text>Transactions</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Tabs variant="unstyled">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Result</Th>
                  <Th>Messages</Th>
                  <Th>Height</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {txs.map((tx) => (
                  <Tr key={tx.hash.toUpperCase()}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/txs/' + tx.hash}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text color={'cyan.400'}>{trimHash(tx.hash)}</Text>
                      </Link>
                    </Td>
                    <Td>
                      <Tag variant="subtle" colorScheme="green">
                        <TagLeftIcon as={FiCheck} />
                        <TagLabel>{tx.result}</TagLabel>
                      </Tag>
                    </Td>
                    <Td>{tx.message}</Td>
                    <Td>{tx.height}</Td>
                    <Td>{timeFromNow(tx.time)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Tabs>
        </Box>
      </main>
    </>
  )
}

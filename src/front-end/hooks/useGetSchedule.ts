import { useAccount, useReadContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'

export function useGetSchedule() {
  const { address: accountAddress } = useAccount();
  const { address, abi } = deployedContracts.DCAScheduler;

  const { data: schedules, isError, isLoading } = useReadContract({
    address,
    abi,
    functionName: 'getDcaTasks',
    account: accountAddress,
  })

  return { schedules, isError, isLoading };
}
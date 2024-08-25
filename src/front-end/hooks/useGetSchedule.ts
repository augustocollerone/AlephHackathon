import { useAccount, useReadContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'

export function useGetSchedule() {
  const { address: accountAddress, isConnected } = useAccount();
  const { address, abi } = deployedContracts.DCAScheduler;

  const { data: schedules, isError, isLoading } = useReadContract({
    address,
    abi,
    functionName: 'getDcaTasks',
    account: accountAddress,
  })

  if (!isConnected) {
    return { schedules: [], isError: false, isLoading: false };
  }

  return { schedules, isError, isLoading };
}
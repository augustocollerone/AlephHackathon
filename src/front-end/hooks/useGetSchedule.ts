import { useAccount, useReadContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'
import { useState, useEffect } from 'react'

export function useGetSchedule() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const { address: accountAddress, isConnected } = useAccount();
  const { address, abi } = deployedContracts.DCAScheduler;

  const { data: contractSchedules, isError, isLoading } = useReadContract({
    address,
    abi,
    functionName: 'getDcaTasks',
    account: accountAddress,
  })

  useEffect(() => {
    if (contractSchedules) {
      setSchedules([...contractSchedules]);
    }
  }, [contractSchedules]);

  if (!isConnected) {
    return { schedules: [], isError: false, isLoading: false, setSchedules: () => {} };
  }

  return { schedules, isError, isLoading, setSchedules };
}
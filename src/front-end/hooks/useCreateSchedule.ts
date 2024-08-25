import { useWriteContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'
import { useState } from 'react'
import { useUSDCApproval } from './useUSDCApproval'
import { parseUnits } from 'viem'

export function useCreateSchedule() {
  const { writeContractAsync, isError, error } = useWriteContract();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { approveUSDC } = useUSDCApproval();

  const createSchedule = async (
    name: string,
    amount: number,
    interval: number,
    maxCount: number,
    tokensAndPercentages: { token: `0x${string}`; percentage: number }[]
  ) => {
    setIsLoading(true);
    try {
      // First, approve USDC spending
      await approveUSDC(amount);

      const { address, abi } = deployedContracts.DCAScheduler;

      const filteredTokensAndPercentages = tokensAndPercentages.filter(
        item => item.percentage > 0
      ).map(item => ({
        token: item.token,
        percentage: Math.floor(item.percentage) // Convert percentage to uint (e.g., 12.34% becomes 1234)
      }));
      
      console.log(filteredTokensAndPercentages);
      

      console.log('Creating schedule...')
      await writeContractAsync({
        address,
        abi,
        functionName: 'createDcaTask',
        args: [
          name,
          parseUnits(amount.toString(), 6), // Convert to USDC with 6 decimal places
          BigInt(interval),
          BigInt(maxCount),
          filteredTokensAndPercentages,
        ],
      });
      setIsSuccess(true);
    } catch (error) {
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createSchedule, 
    isError, 
    error, 
    isSuccess,
    isLoading
  };
}
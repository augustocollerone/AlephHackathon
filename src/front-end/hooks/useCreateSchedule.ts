import { useWriteContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'
import { useState } from 'react'

export function useCreateSchedule() {
  const { writeContractAsync, isError, error } = useWriteContract();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createSchedule = async (
    name: string,
    amount: number,
    interval: number,
    maxCount: number,
  ) => {
    setIsLoading(true);
    try {
      const { address, abi } = deployedContracts.DCAScheduler;
      
      await writeContractAsync({
        address,
        abi,
        functionName: 'createDcaTask',
        args: [
          name,
          BigInt(Math.floor(amount * 1e6)), // Convert to USDC with 6 decimal places
          BigInt(interval),
          BigInt(maxCount),
          '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
        ],
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to create schedule:", error);
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
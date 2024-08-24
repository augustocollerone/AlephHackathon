import { useWriteContract } from 'wagmi'
import deployedContracts from '../contracts/deployedContracts'

export function useCreateSchedule() {
  const { writeContractAsync } = useWriteContract();

  const createSchedule = async (
    name: string,
    amount: bigint,
    interval: number,
    maxCount: number,
    feeToken: string
  ) => {

    console.log("Creating schedule");
    try {
      const { address, abi } = deployedContracts.DCAScheduler;
      
      await writeContractAsync({
        address,
        abi,
        functionName: 'createDcaTask',
        args: [
          name,
          amount,
          BigInt(interval),
          BigInt(maxCount),
          '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
        ],
      });
    } catch (error) {
      console.error('Error creating DCA schedule:', error);
      throw error;
    }
  };

  return { createSchedule };
}
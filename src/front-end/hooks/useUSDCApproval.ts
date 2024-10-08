import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'
import { USDC_ADDRESS } from '@/contracts/swapContracts'
import deployedContracts from '@/contracts/deployedContracts'
import { erc20Abi } from 'viem'
import { useGetSchedule } from './useGetSchedule'

export function useUSDCApproval() {
  const { address } = useAccount()
  const { schedules } = useGetSchedule()
  const { writeContractAsync } = useWriteContract()

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, deployedContracts.DCAScheduler.address],
  })

  const approveUSDC = async (newAmount: number) => {
    const newAmountWei = parseUnits(newAmount.toString(), 6) // Convert new amount to decimals (USDC has 6 decimals)
    const totalScheduledAmount = schedules?.reduce((sum, schedule) => sum + BigInt(schedule.amount), BigInt(0)) ?? BigInt(0)
    const totalRequiredAmountWei = totalScheduledAmount + BigInt(newAmountWei)

    if (!allowance || totalRequiredAmountWei > allowance) {
      try {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [deployedContracts.DCAScheduler.address, totalRequiredAmountWei],
        })
      } catch (error) {
        throw error
      }
    } else {
    }
  }

  return { approveUSDC, allowance }
}
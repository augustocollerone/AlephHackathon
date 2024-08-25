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

    console.log(totalRequiredAmountWei, allowance);

    if (!allowance || totalRequiredAmountWei > allowance) {
      console.log('Approving USDC...')
      try {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [deployedContracts.DCAScheduler.address, totalRequiredAmountWei],
        })
        console.log('USDC approved successfully')
      } catch (error) {
        console.error('Error approving USDC:', error)
        throw error
      }
    } else {
      console.log('Sufficient allowance already exists')
    }
  }

  return { approveUSDC, allowance }
}
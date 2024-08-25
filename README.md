# ALEPH HACKATHON - DCA Scheduler

This repository contains a decentralized application (DApp) for creating and managing Dollar-Cost Averaging (DCA) schedules on the Arbitrum network. The project consists of two main parts: smart contracts and a front-end application.

## Table of Contents

1. [Overview](#overview)
2. [Smart Contracts](#smart-contracts)
3. [Front-end Application](#front-end-application)
4. [Getting Started](#getting-started)
5. [Usage](#usage)
6. [Development](#development)
7. [Contributing](#contributing)
8. [License](#license)

## Overview

The DCA Scheduler allows users to create automated, periodic investments in various cryptocurrencies. Users can set up schedules to invest a fixed amount of USDC into multiple assets at regular intervals.

## Smart Contracts

The smart contracts are located in the `src/contracts` directory. The main contract is `DCAScheduler`, which handles the creation and execution of DCA tasks.

Key features:
- Create DCA tasks with customizable parameters
- Execute DCA tasks automatically using Gelato automation
- Swap USDC for multiple assets in a single transaction
- Manage and track DCA task execution

### Contract Structure

src/contracts/
├── contracts/
│ └── DCAScheduler.sol
├── test/
│ └── Lock.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json

## Front-end Application

The front-end is a Next.js application located in the `src/front-end` directory. It provides a user interface for interacting with the DCA Scheduler contract.

Key features:
- Connect wallet using RainbowKit
- Create new DCA schedules
- View and manage existing schedules
- Display execution history and performance charts

### Front-end Structure

src/front-end/
├── app/
│ ├── layout.tsx
│ ├── page.tsx
│ └── providers.tsx
├── components/
│ ├── create-dca-schedule-card.tsx
│ ├── schedule-details.tsx
│ ├── schedule-list-table.tsx
│ └── ui/
├── contracts/
│ ├── deployedContracts.ts
│ └── swapContracts.ts
├── hooks/
│ ├── useCreateSchedule.ts
│ ├── useGetSchedule.ts
│ └── useUSDCApproval.ts
├── public/
├── package.json
└── tsconfig.json


## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ALEPHHACKATHON.git
   cd ALEPHHACKATHON
   ```

2. Install dependencies for both contracts and front-end:
   ```
   cd src/contracts
   npm install
   cd ../front-end
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `src/front-end` directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_ENABLE_TESTNETS=true
     NEXT_PUBLIC_PROJECT_ID=your_wallet_connect_project_id
     ```

## Usage

1. Deploy the smart contracts to the Arbitrum network (make sure you have the correct network configured in `hardhat.config.ts`):
   ```
   cd src/contracts
   npx hardhat run scripts/deploy.ts --network arbitrum
   ```

2. Update the deployed contract address in `src/front-end/contracts/deployedContracts.ts`.

3. Run the front-end application:
   ```
   cd src/front-end
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to use the DApp.

## Development

- To run tests for the smart contracts:
  ```
  cd src/contracts
  npx hardhat test
  ```

- To lint the front-end code:
  ```
  cd src/front-end
  npm run lint
  ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
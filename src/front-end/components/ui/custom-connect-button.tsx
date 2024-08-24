import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button"
import { 
  ChevronDownIcon, 
  Loader2Icon, 
  WalletIcon 
} from 'lucide-react';

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button" className="w-auto">
                    <WalletIcon className="h-4 w-4" />
                    <span className="hidden sm:inline-block sm:ml-2">Connect</span>
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button" variant="destructive" className="w-auto">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline-block sm:ml-2">Wrong network</span>
                  </Button>
                );
              }

              return (
                <div className="flex gap-2">
                  <Button
                    onClick={openChainModal}
                    type="button"
                    variant="outline"
                    className="w-auto p-2 sm:p-3"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-3 h-3 rounded-full overflow-hidden"
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-3 h-3"
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:inline-block sm:ml-2">{chain.name}</span>
                  </Button>

                  <Button onClick={openAccountModal} type="button" className="w-auto p-2 sm:p-3">
                    <span className="hidden sm:inline-block">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 sm:ml-2" />
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
import { INativeCsprDeploy } from 'casper-wallet-core/src/domain/deploys/entities';
import React from 'react';

import { DeployIcon } from '@src/constants';

import { getEntryPointName } from '@popup/pages/deploy-details/utils';

import { AlignedFlexRow, SpacingSize } from '@libs/layout';
import { Typography } from '@libs/ui/components';
import { AccountInfoRow } from '@libs/ui/components/account-info-row/account-info-row';
import { DeployContainer } from '@libs/ui/components/deploy-plate/components/deploy-container';

interface NativeTransferDeployRowsProps {
  deploy: INativeCsprDeploy;
}

export const NativeTransferDeployRows = ({
  deploy
}: NativeTransferDeployRowsProps) => {
  const title = getEntryPointName(deploy);

  return (
    <DeployContainer
      timestamp={deploy.timestamp}
      iconUrl={DeployIcon.NativeTransfer}
      title={title}
      deployStatus={{
        status: deploy.status,
        errorMessage: deploy.errorMessage
      }}
    >
      <AlignedFlexRow gap={SpacingSize.Tiny} style={{ maxWidth: '240px' }}>
        <Typography type="captionHash" ellipsis>
          {deploy.formattedDecimalAmount}
        </Typography>
        <Typography type="captionHash" color="contentSecondary">
          CSPR
        </Typography>
      </AlignedFlexRow>
      <AccountInfoRow
        label={deploy.isReceive ? 'from' : 'to'}
        publicKey={
          deploy.isReceive
            ? deploy.callerPublicKey ||
              deploy.callerAccountInfo?.accountHash ||
              ''
            : deploy.recipientKey ||
              deploy.recipientAccountInfo?.accountHash ||
              ''
        }
        imgLogo={
          deploy.isReceive
            ? deploy.callerAccountInfo?.brandingLogo
            : deploy.recipientAccountInfo?.brandingLogo
        }
        accountName={
          deploy.isReceive
            ? deploy.callerAccountInfo?.name
            : deploy.recipientAccountInfo?.name
        }
        csprName={
          deploy.isReceive
            ? deploy.callerAccountInfo?.csprName
            : deploy.recipientAccountInfo?.csprName
        }
      />
    </DeployContainer>
  );
};

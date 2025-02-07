import { INftDeploy } from 'casper-wallet-core/src/domain/deploys/entities';
import React from 'react';

import { DeployIcon, NftDeployEntryPoint } from '@src/constants';

import { DefaultActionRows } from '@popup/pages/deploy-details/components/action-rows/default-action-rows';
import {
  NftInfoRow,
  SimpleContainer
} from '@popup/pages/deploy-details/components/common';
import { getEntryPointName } from '@popup/pages/deploy-details/utils';

import { AccountInfoRow } from '@libs/ui/components/account-info-row/account-info-row';

interface NftActionsRowsProps {
  deploy: INftDeploy;
}

export const NftActionsRows = ({ deploy }: NftActionsRowsProps) => {
  const {
    entryPoint,
    nftTokenIds,
    recipientKey,
    contractPackageHash,
    contractName,
    callerPublicKey,
    iconUrl,
    callerAccountInfo,
    recipientAccountInfo,
    contractHash
  } = deploy;
  const isBurn = entryPoint === NftDeployEntryPoint.burn;
  const isMint = entryPoint === NftDeployEntryPoint.mint;
  const isTransfer = entryPoint === NftDeployEntryPoint.transfer;
  const isUpdate = entryPoint === NftDeployEntryPoint.update_token_meta;
  const isApprove =
    entryPoint === NftDeployEntryPoint.approve ||
    entryPoint === NftDeployEntryPoint.set_approval_for_all;

  const title = getEntryPointName(deploy, true);

  if (isBurn) {
    return (
      <SimpleContainer title={title}>
        <NftInfoRow
          contractPackageHash={contractPackageHash}
          contractName={contractName}
          imgLogo={iconUrl}
          nftTokenIds={nftTokenIds}
          defaultSvg={DeployIcon.NFTDefault}
          collectionHash={contractHash}
        />
        <AccountInfoRow
          publicKey={recipientKey}
          accountName={recipientAccountInfo?.name}
          label="owned by"
          isAction
          iconSize={20}
          csprName={recipientAccountInfo?.csprName}
          imgLogo={recipientAccountInfo?.brandingLogo}
        />
      </SimpleContainer>
    );
  }

  if (isMint) {
    return (
      <SimpleContainer title={title}>
        <NftInfoRow
          contractPackageHash={contractPackageHash}
          contractName={contractName}
          imgLogo={iconUrl}
          nftTokenIds={nftTokenIds}
          defaultSvg={DeployIcon.NFTDefault}
          collectionHash={contractHash}
        />
        <AccountInfoRow
          publicKey={recipientKey}
          accountName={recipientAccountInfo?.name}
          label="to"
          isAction
          iconSize={20}
          csprName={recipientAccountInfo?.csprName}
          imgLogo={recipientAccountInfo?.brandingLogo}
        />
      </SimpleContainer>
    );
  }

  if (isTransfer) {
    return (
      <SimpleContainer title={title}>
        <NftInfoRow
          contractPackageHash={contractPackageHash}
          contractName={contractName}
          imgLogo={iconUrl}
          nftTokenIds={nftTokenIds}
          defaultSvg={DeployIcon.NFTDefault}
          collectionHash={contractHash}
        />
        <AccountInfoRow
          publicKey={callerPublicKey}
          accountName={callerAccountInfo?.name}
          label="from"
          isAction
          iconSize={20}
          csprName={callerAccountInfo?.csprName}
          imgLogo={callerAccountInfo?.brandingLogo}
        />
        <AccountInfoRow
          publicKey={recipientKey}
          accountName={recipientAccountInfo?.name}
          label="to"
          isAction
          iconSize={20}
          csprName={recipientAccountInfo?.csprName}
          imgLogo={recipientAccountInfo?.brandingLogo}
        />
      </SimpleContainer>
    );
  }

  if (isUpdate) {
    return (
      <SimpleContainer title={title}>
        <NftInfoRow
          contractPackageHash={contractPackageHash}
          contractName={contractName}
          imgLogo={iconUrl}
          nftTokenIds={nftTokenIds}
          defaultSvg={DeployIcon.NFTDefault}
          collectionHash={contractHash}
        />
      </SimpleContainer>
    );
  }

  if (isApprove) {
    return (
      <SimpleContainer title={title}>
        <NftInfoRow
          contractPackageHash={contractPackageHash}
          contractName={contractName}
          imgLogo={iconUrl}
          nftTokenIds={nftTokenIds}
          defaultSvg={DeployIcon.NFTDefault}
          label="for"
          isApprove
          collectionHash={contractHash}
        />
        <AccountInfoRow
          publicKey={recipientKey}
          label="to"
          isAction
          iconSize={20}
          csprName={recipientAccountInfo?.csprName}
          imgLogo={recipientAccountInfo?.brandingLogo}
        />
      </SimpleContainer>
    );
  }

  return (
    <DefaultActionRows
      title={title}
      contractPackageHash={contractPackageHash}
      contractName={contractName}
      additionalInfo="CEP-47 NFT"
      iconUrl={iconUrl || DeployIcon.NFTDefault}
    />
  );
};

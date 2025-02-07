import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
  selectConnectedAccountNamesWithActiveOrigin,
  selectVaultAccountsExceptLedgersAccounts,
  selectVaultAccountsPublicKeys,
  selectVaultActiveAccountName
} from '@background/redux/vault/selectors';

import { getAccountHashFromPublicKey } from '@libs/entities/Account';
import {
  ContentContainer,
  ParagraphContainer,
  SpacingSize
} from '@libs/layout';
import { useFetchAccountsInfo } from '@libs/services/account-info';
import { useFetchWalletBalance } from '@libs/services/balance-service';
import {
  AccountListRowWithAccountHash,
  AccountListRows
} from '@libs/types/account';
import { List, Typography } from '@libs/ui/components';

import { AccountListItem } from './components/account-list-item';

interface DownloadProps {
  setSelectedAccounts: React.Dispatch<React.SetStateAction<AccountListRows[]>>;
  selectedAccounts: AccountListRows[];
}

export const Download = ({
  setSelectedAccounts,
  selectedAccounts
}: DownloadProps) => {
  const [accountsWithId, setAccountsWithId] = useState<
    AccountListRowWithAccountHash<AccountListRows>[]
  >([]);

  const { t } = useTranslation();

  const accounts = useSelector(selectVaultAccountsExceptLedgersAccounts);
  const connectedAccountNames =
    useSelector(selectConnectedAccountNamesWithActiveOrigin) || [];
  const activeAccountName = useSelector(selectVaultActiveAccountName);
  const accountsPublicKeys = useSelector(selectVaultAccountsPublicKeys);

  const accountsInfo = useFetchAccountsInfo(accountsPublicKeys);
  const { accountsBalances } = useFetchWalletBalance();

  useEffect(() => {
    const accountsWithId = accounts.map(account => ({
      ...account,
      id: account.name,
      accountHash: getAccountHashFromPublicKey(account.publicKey)
    }));

    setAccountsWithId(accountsWithId);
  }, [accounts, setAccountsWithId]);

  const areAllAccountsSelected =
    accountsWithId.length === selectedAccounts.length;

  const toggleAccount = (account: AccountListRows) => {
    setSelectedAccounts(prevAccounts => {
      // check if the account is already selected
      const foundIndex = prevAccounts.findIndex(acc => acc.id === account.id);
      // if not selected yet, add to list, otherwise remove
      if (foundIndex === -1) {
        return [...prevAccounts, account];
      } else {
        return prevAccounts.filter((_, index) => index !== foundIndex);
      }
    });
  };

  const handleSelectAll = useCallback(() => {
    setSelectedAccounts(accountsWithId);
  }, [accountsWithId, setSelectedAccounts]);

  const handleUnselectAll = useCallback(() => {
    setSelectedAccounts([]);
  }, [setSelectedAccounts]);

  const headerAction = useMemo(() => {
    const captionSelectAll = t('select all');
    const captionUnselectAll = t('unselect all');

    return areAllAccountsSelected
      ? { caption: captionUnselectAll, onClick: handleUnselectAll }
      : { caption: captionSelectAll, onClick: handleSelectAll };
  }, [t, areAllAccountsSelected, handleSelectAll, handleUnselectAll]);

  return (
    <ContentContainer>
      <ParagraphContainer top={SpacingSize.XL}>
        <Typography type="header">
          <Trans t={t}>Select accounts to download private keys</Trans>
        </Typography>
      </ParagraphContainer>

      <List
        contentTop={SpacingSize.Small}
        headerLabelTop={SpacingSize.XXXL}
        rows={accountsWithId}
        headerLabel={t('account(s)')}
        headerAction={headerAction}
        renderRow={account => {
          const isConnected = connectedAccountNames.includes(account.name);
          const isActiveAccount = activeAccountName === account.name;
          const isSelected =
            selectedAccounts.findIndex(acc => acc.id === account.id) !== -1;

          const accountLiquidBalance =
            accountsBalances &&
            accountsBalances[account.accountHash]?.liquidBalance;

          return (
            <AccountListItem
              account={account}
              isConnected={isConnected}
              isActiveAccount={isActiveAccount}
              onClick={() => toggleAccount(account)}
              isSelected={isSelected}
              accountLiquidBalance={accountLiquidBalance}
              accountsInfo={accountsInfo}
            />
          );
        }}
        marginLeftForItemSeparatorLine={54}
      />
    </ContentContainer>
  );
};

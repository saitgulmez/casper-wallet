import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HashRouter } from 'react-router-dom';

import { RouterPath } from '@src/apps/connect-to-app/router';
import { ConnectAccountPage } from '@src/apps/connect-to-app/pages/connect-accounts';
import { ApproveConnectionPage } from '@src/apps/connect-to-app/pages/approve-connection';
import { ConnectingPage } from '@src/apps/connect-to-app/pages/connecting';
import { useUserActivityTracker } from '@src/hooks/use-user-activity-tracker';
import { useSelector } from 'react-redux';
import { selectVaultIsLocked } from '@src/background/redux/session/selectors';
import { LockedRouter } from '@src/libs/layout/locked-router';
import { SwitchAccountPage } from './pages/switch-account';

export function AppRouter() {
  useUserActivityTracker();

  const urlParams = new URLSearchParams(window.location.search);
  const switchAccount = urlParams.get('switchAccount');

  const [selectedAccountNames, setSelectedAccountNames] = useState<string[]>(
    []
  );
  const { origin, title } = useSiteRelatedData();

  const isLocked = useSelector(selectVaultIsLocked);
  if (isLocked) {
    return <LockedRouter />;
  }

  if (switchAccount) {
    return (
      <HashRouter>
        <Routes>
          <Route
            path={RouterPath.SwitchAccount}
            element={<SwitchAccountPage />}
          />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path={RouterPath.ConnectAccount}
          element={
            <ConnectAccountPage
              selectedAccountNames={selectedAccountNames}
              setSelectedAccountNames={setSelectedAccountNames}
              origin={origin}
              title={title}
            />
          }
        />
        <Route
          path={RouterPath.ApproveConnection}
          element={
            <ApproveConnectionPage
              selectedAccountNames={selectedAccountNames}
              origin={origin}
              title={title}
            />
          }
        />
        <Route path={RouterPath.Connecting} element={<ConnectingPage />} />
      </Routes>
    </HashRouter>
  );
}

function useSiteRelatedData() {
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(document.location.search);
  const origin = searchParams.get('origin');
  const siteTitle = searchParams.get('title');

  if (origin == null) {
    throw new Error('Missing origin search param');
  }

  const connectWith = t('Connect with');
  const title = `${connectWith} ${
    siteTitle != null ? siteTitle : origin.split('://')[1]
  }`;

  return {
    origin,
    title
  };
}

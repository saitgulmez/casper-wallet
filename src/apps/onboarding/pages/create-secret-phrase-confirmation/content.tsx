import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  SpacingSize,
  TabPageContainer,
  VerticalSpaceContainer
} from '@libs/layout';
import { TextList, Typography } from '@libs/ui/components';

export function CreateSecretPhraseConfirmationPageContent() {
  const { t } = useTranslation();

  const items = [
    { key: 1, value: t('Save a backup in multiple secure locations.') },
    { key: 2, value: t('Never share the phrase with anyone.') },
    {
      key: 3,
      value: t(
        'Be careful of phishing! Casper Wallet will never spontaneously ask you for your secret recovery phrase.'
      )
    },
    {
      key: 4,
      value: t(
        'If you need to back up your secret recovery phrase again, you can find it in Settings.'
      )
    },
    {
      key: 5,
      value: t(
        'Casper Wallet cannot recover your secret recovery phrase! If you lose it, you may not be able to recover your funds.'
      )
    }
  ];

  return (
    <TabPageContainer>
      <Typography type="captionMedium" color="contentActionCritical" uppercase>
        <Trans t={t}>Step 3</Trans>
      </Typography>
      <VerticalSpaceContainer top={SpacingSize.Tiny}>
        <Typography type="headerBig">
          <Trans t={t}>
            Before we generate your secret recovery phrase, please remember
          </Trans>
        </Typography>
      </VerticalSpaceContainer>

      <VerticalSpaceContainer top={SpacingSize.XL}>
        <TextList items={items} />
      </VerticalSpaceContainer>
    </TabPageContainer>
  );
}

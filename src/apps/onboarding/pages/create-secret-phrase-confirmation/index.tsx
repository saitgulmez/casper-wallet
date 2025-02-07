import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Stepper } from '@onboarding/components/stepper';
import { SetFormState } from '@onboarding/hooks/use-onboarding-form-state';
import { RouterPath } from '@onboarding/router';
import { useTypedNavigate } from '@onboarding/router/use-typed-navigate';

import { generateSecretPhrase } from '@libs/crypto';
import {
  HeaderSubmenuBarNavLink,
  LayoutTab,
  TabFooterContainer,
  TabHeaderContainer
} from '@libs/layout';
import { Button, Checkbox } from '@libs/ui/components';

import { CreateSecretPhraseConfirmationPageContent } from './content';

interface CreateSecretPhraseConfirmationPageProps {
  setFormState: SetFormState;
}

export function CreateSecretPhraseConfirmationPage({
  setFormState
}: CreateSecretPhraseConfirmationPageProps) {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useTypedNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate(RouterPath.CreateSecretPhrase);
  };

  return (
    <LayoutTab
      layoutContext="withStepper"
      minHeight={680}
      renderHeader={() => (
        <TabHeaderContainer>
          <HeaderSubmenuBarNavLink linkType="back" onClick={handleBack} />
          <Stepper length={6} activeIndex={2} />
        </TabHeaderContainer>
      )}
      renderContent={() => <CreateSecretPhraseConfirmationPageContent />}
      renderFooter={() => (
        <TabFooterContainer style={{ marginTop: '28px' }}>
          <Checkbox
            checked={isChecked}
            onChange={() => setIsChecked(currentValue => !currentValue)}
            label={t(
              'I understand that I am solely responsible for storing and protecting my secret recovery phrase. Access to my funds depend on it.'
            )}
          />
          <Button
            disabled={!isChecked}
            onClick={() => {
              setFormState('secretPhrase', generateSecretPhrase());
              navigate(RouterPath.WriteDownSecretPhrase);
            }}
          >
            <Trans t={t}>Next</Trans>
          </Button>
        </TabFooterContainer>
      )}
    />
  );
}

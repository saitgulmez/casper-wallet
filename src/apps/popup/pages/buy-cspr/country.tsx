import { IOnRampCountry } from 'casper-wallet-core/src/domain';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import {
  ContentContainer,
  InputsContainer,
  ParagraphContainer,
  SpacingSize
} from '@libs/layout';
import { useFetchWalletBalance } from '@libs/services/balance-service';
import {
  ActiveAccountPlate,
  Input,
  List,
  Modal,
  ModalSwitcher,
  SvgIcon,
  Typography
} from '@libs/ui/components';

import { CountryRow } from './components/country-row';
import { ListRow } from './components/list-row';
import { sortCountries } from './utils';

interface CountryProps {
  availableCountries: IOnRampCountry[];
  setSelectedCountry: React.Dispatch<React.SetStateAction<IOnRampCountry>>;
  selectedCountry: IOnRampCountry;
  isLoadingOnRampCountriesAndCurrencies: boolean;
}

type ExtendedOnRampCountry = IOnRampCountry & { id: number };

export const Country = ({
  availableCountries,
  setSelectedCountry,
  selectedCountry,
  isLoadingOnRampCountriesAndCurrencies
}: CountryProps) => {
  const [sortedCountries, setSortedCountries] = useState<
    ExtendedOnRampCountry[]
  >([]);
  const { t } = useTranslation();

  const { accountBalance } = useFetchWalletBalance();

  const { register, control, setValue } = useForm();

  const inputValue = useWatch({
    control: control,
    name: 'countryNameSearch'
  });

  useEffect(() => {
    const sortedCountries = sortCountries(
      availableCountries,
      selectedCountry?.code
    )
      .filter(
        country =>
          country?.name.toLowerCase().includes(inputValue?.toLowerCase() || '')
      )
      .map((country, index) => ({
        ...country,
        id: index
      }));

    setSortedCountries(sortedCountries);
  }, [availableCountries, inputValue, selectedCountry]);

  return (
    <ContentContainer>
      <ParagraphContainer top={SpacingSize.XL}>
        <Typography type="header">
          <Trans t={t}>Pick country</Trans>
        </Typography>
      </ParagraphContainer>

      <ActiveAccountPlate
        label="Recipient account"
        balance={accountBalance.liquidDecimalBalance}
        symbol="CSPR"
      />

      <Modal
        renderContent={({ closeModal }) => (
          <ModalSwitcher closeSwitcher={closeModal} label="Country">
            <InputsContainer>
              <Input
                prefixIcon={<SvgIcon src="assets/icons/search.svg" size={24} />}
                placeholder={t('Search')}
                {...register('countryNameSearch')}
              />
            </InputsContainer>
            <List
              contentTop={SpacingSize.Medium}
              rows={sortedCountries}
              height={280}
              renderRow={country => {
                const isSelected = selectedCountry?.code === country?.code;

                return (
                  <ListRow
                    country={country}
                    handleSelect={(
                      e: React.MouseEvent<Element, MouseEvent>
                    ) => {
                      if (isSelected) {
                        return;
                      }
                      setSelectedCountry(country);
                      closeModal(e);
                    }}
                    isSelected={isSelected}
                  />
                );
              }}
              marginLeftForItemSeparatorLine={54}
            />
          </ModalSwitcher>
        )}
        placement="fullBottom"
        children={() => (
          <CountryRow
            country={selectedCountry}
            onClick={() => setValue('countryNameSearch', '')}
            isLoadingOnRampCountriesAndCurrencies={
              isLoadingOnRampCountriesAndCurrencies
            }
          />
        )}
        loading={!sortedCountries.length}
      />
    </ContentContainer>
  );
};

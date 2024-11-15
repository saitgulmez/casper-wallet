import { put, select, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import { alarms } from 'webextension-polyfill';

import { getUrlOrigin } from '@src/utils';

import {
  LOCK_VAULT_TIMEOUT,
  MapTimeoutDurationSettingToValue
} from '@popup/constants';

import {
  loginRetryLockoutTimeReseted,
  loginRetryLockoutTimeSet
} from '@background/redux/login-retry-lockout-time/actions';
import { selectLoginRetryLockoutTime } from '@background/redux/login-retry-lockout-time/selectors';
import { emitSdkEventToActiveTabs } from '@background/utils';

import { sdkEvent } from '@content/sdk-event';

import { deriveKeyPair } from '@libs/crypto';
import { encryptVault } from '@libs/crypto/vault';
import { Account } from '@libs/types/account';

import { accountInfoReset } from '../account-info/actions';
import { keysUpdated } from '../keys/actions';
import { lastActivityTimeRefreshed } from '../last-activity-time/actions';
import { loginRetryCountReseted } from '../login-retry-count/actions';
import {
  encryptionKeyHashCreated,
  sessionReseted,
  vaultUnlocked
} from '../session/actions';
import {
  selectEncryptionKeyHash,
  selectVaultIsLocked
} from '../session/selectors';
import { activeTimeoutDurationSettingChanged } from '../settings/actions';
import { selectTimeoutDurationSetting } from '../settings/selectors';
import { sagaCall, sagaSelect } from '../utils';
import { vaultCipherCreated } from '../vault-cipher/actions';
import { selectVaultCipherDoesExist } from '../vault-cipher/selectors';
import {
  accountAdded,
  accountDisconnected,
  accountImported,
  accountRemoved,
  accountRenamed,
  accountsAdded,
  accountsImported,
  activeAccountChanged,
  anotherAccountConnected,
  deployPayloadReceived,
  deploysReseted,
  hideAccountFromListChanged,
  siteConnected,
  siteDisconnected,
  vaultLoaded,
  vaultReseted
} from '../vault/actions';
import {
  selectAccountNamesByOriginDict,
  selectSecretPhrase,
  selectVault,
  selectVaultActiveAccount,
  selectVaultDerivedAccounts
} from '../vault/selectors';
import { popupWindowInit } from '../windowManagement/actions';
import {
  createAccount,
  lockVault,
  startBackground,
  unlockVault
} from './actions';

export function* vaultSagas() {
  yield takeLatest(getType(lockVault), lockVaultSaga);
  yield takeLatest(
    [getType(loginRetryLockoutTimeSet), getType(popupWindowInit)],
    setDelayForLockoutVaultSaga
  );
  yield takeLatest(getType(unlockVault), unlockVaultSaga);
  yield takeLatest(
    [
      getType(startBackground),
      getType(lastActivityTimeRefreshed),
      getType(activeTimeoutDurationSettingChanged)
    ],
    timeoutCounterSaga
  );
  yield takeLatest(
    [
      getType(accountAdded),
      getType(accountsAdded),
      getType(accountImported),
      getType(accountsImported),
      getType(accountRemoved),
      getType(accountRenamed),
      getType(siteConnected),
      getType(anotherAccountConnected),
      getType(accountDisconnected),
      getType(siteDisconnected),
      getType(activeAccountChanged),
      getType(activeTimeoutDurationSettingChanged),
      getType(deployPayloadReceived),
      getType(hideAccountFromListChanged)
    ],
    updateVaultCipher
  );
  yield takeLatest(getType(createAccount), createAccountSaga);
}

/**
 * on lock destroy session, vault and deploys
 */
function* lockVaultSaga() {
  try {
    yield put(sessionReseted());
    yield put(vaultReseted());
    yield put(deploysReseted());
    yield put(accountInfoReset());

    emitSdkEventToActiveTabs(() => {
      return sdkEvent.lockedEvent({
        isLocked: true,
        isConnected: undefined,
        activeKey: undefined
      });
    });
  } catch (err) {
    console.error(err);
  }
}

function* setDelayForLockoutVaultSaga() {
  const loginRetryLockoutTime: number | null = yield select(
    selectLoginRetryLockoutTime
  );

  if (loginRetryLockoutTime == null) {
    return;
  }

  const currentTime = Date.now();
  const isTimeoutExpired =
    currentTime - loginRetryLockoutTime >= LOCK_VAULT_TIMEOUT;

  //  if the timeout expired we reset the count and lockout time
  if (isTimeoutExpired) {
    yield put(loginRetryCountReseted());
    yield put(loginRetryLockoutTimeReseted());
  }

  //  if the timeout has not expired we set the timer with the time that is left
  if (!isTimeoutExpired) {
    const timeLeft = LOCK_VAULT_TIMEOUT - (currentTime - loginRetryLockoutTime);
    const delay = (ms: number) =>
      new Promise(resolve => setTimeout(resolve, ms));

    yield* sagaCall(delay, timeLeft);

    yield put(loginRetryCountReseted());
    yield put(loginRetryLockoutTimeReseted());
  }
}

/**
 * on unlock decrypt stored vault from cipher
 * generate a new encryption key each login and update existing cipher (collisions0
 * put new encryption key in session
 */
function* unlockVaultSaga(action: ReturnType<typeof unlockVault>) {
  try {
    const {
      vault,
      newKeyDerivationSaltHash,
      newVaultCipher,
      newEncryptionKeyHash
    } = action.payload;

    yield put(loginRetryCountReseted());
    yield put(vaultLoaded(vault));
    yield put(
      keysUpdated({
        keyDerivationSaltHash: newKeyDerivationSaltHash
      })
    );
    yield put(
      vaultCipherCreated({
        vaultCipher: newVaultCipher
      })
    );
    yield put(
      encryptionKeyHashCreated({ encryptionKeyHash: newEncryptionKeyHash })
    );
    yield put(vaultUnlocked());

    const accountNamesByOriginDict = yield* sagaSelect(
      selectAccountNamesByOriginDict
    );

    const isActiveAccountConnectedWith = (origin: string | undefined) => {
      const accountNames = origin && accountNamesByOriginDict[origin];
      if (accountNames == null) {
        return false;
      }
      return accountNames.includes(activeAccount?.name || '');
    };

    const activeAccount = yield* sagaSelect(selectVaultActiveAccount);

    if (activeAccount) {
      emitSdkEventToActiveTabs(tab => {
        if (!tab.url) {
          return;
        }

        const isActiveAccountConnectedWithTab = isActiveAccountConnectedWith(
          getUrlOrigin(tab.url)
        );

        return sdkEvent.unlockedEvent({
          isLocked: false,
          isConnected: isActiveAccountConnectedWithTab,
          activeKey: isActiveAccountConnectedWithTab
            ? activeAccount.publicKey
            : undefined
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * This saga function is responsible for managing the vault timeout and locking mechanism.
 * It checks if the vault exists and is not locked, retrieves the vault timeout duration setting,
 * calculates the timeout duration value based on the setting, and creates an alarm to lock the vault.
 * If an error occurs during the execution, it logs the error.
 */
function* timeoutCounterSaga() {
  try {
    // Check if the vault exists and is not locked
    const vaultDoesExist = yield* sagaSelect(selectVaultCipherDoesExist);
    const vaultIsLocked = yield* sagaSelect(selectVaultIsLocked);

    // Get the vault timeout duration setting
    const vaultTimeoutDurationSetting = yield* sagaSelect(
      selectTimeoutDurationSetting
    );

    // Calculate the timeout duration value based on the setting
    const timeoutDurationValue =
      MapTimeoutDurationSettingToValue[vaultTimeoutDurationSetting];

    // If the vault exists and is not locked, create an alarm to lock the vault
    if (vaultDoesExist && !vaultIsLocked) {
      alarms.create('vaultLock', {
        delayInMinutes: timeoutDurationValue
      });
    }
  } catch (err) {
    // Log any errors that occur during the execution of the saga
    console.error(err, 'err');
  }
}

/**
 * update vault cipher on each vault update
 */
function* updateVaultCipher() {
  try {
    // get current encryption key
    const encryptionKeyHash = yield* sagaSelect(selectEncryptionKeyHash);
    // encrypt cipher with the new key
    const vault = yield* sagaSelect(selectVault);

    const vaultCipher = yield* sagaCall(() =>
      encryptVault(encryptionKeyHash, vault)
    );

    yield put(
      vaultCipherCreated({
        vaultCipher
      })
    );
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 */
function* createAccountSaga(action: ReturnType<typeof createAccount>) {
  try {
    const { name } = action.payload;

    if (name == null) {
      throw Error('Account name missing');
    }

    const derivedAccounts = yield* sagaSelect(selectVaultDerivedAccounts);

    if (derivedAccounts.find(a => a.name === name)) {
      throw Error('Account name exist');
    }

    let isAccountAlreadyAdded = true;
    let i = 0;

    const secretPhrase = yield* sagaSelect(selectSecretPhrase);

    while (isAccountAlreadyAdded) {
      const keyPair = deriveKeyPair(secretPhrase, i);
      if (
        !derivedAccounts.some(
          account => account.publicKey === keyPair.publicKey
        )
      ) {
        isAccountAlreadyAdded = false;

        const account: Account = {
          ...keyPair,
          name,
          hidden: false,
          derivationIndex: i
        };
        yield put(accountAdded(account));
        break;
      }
      i++;
    }
  } catch (err) {
    console.error(err);
  }
}

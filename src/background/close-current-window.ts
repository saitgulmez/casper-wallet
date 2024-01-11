import { windows } from 'webextension-polyfill';

// import { getWindowId } from '@background/redux/import-account-actions-should-be-removed';

export async function closeCurrentWindow() {
  try {
    // const windowId = await getWindowId();
    // if (windowId) {
    //   await browser.windows.remove(windowId);
    // } else {
    // If there is no windowId in the state it'll fallback to use currentWindow id to close
    const currentWindow = await windows.getCurrent();
    if (currentWindow.type === 'popup' && currentWindow.id) {
      await windows.remove(currentWindow.id);
    }
    // }
  } catch (error) {
    throw error;
  }
}

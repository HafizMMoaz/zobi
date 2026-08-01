import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import {
  StrictBroadcastChannel,
  TabIdChannelMessage,
} from './strictBroadcastChannel';

const TAB_ID_CHANNEL_NAME = 'tab_id_channel';

const channel: StrictBroadcastChannel<TabIdChannelMessage> =
  new BroadcastChannel(TAB_ID_CHANNEL_NAME);

export function useTabId() {
  const [tabId, setTabId] = useState<string>();

  function isStorageAvailable() {
    try {
      return window.localStorage && window.sessionStorage;
    } catch (error) {
      return false;
    }
  }
  useEffect(() => {
    if (!isStorageAvailable()) {
      if (!tabId) {
        setTabId(nanoid());
      }
      return;
    }

    const updateTabId = () => {
      let lastTabId;
      try {
        lastTabId = window.localStorage.getItem('last_tab_id');
      } catch (error) {
        // continue regardless of error
      }
      const newTabId = String(
        lastTabId ? Number.parseInt(lastTabId, 10) + 1 : 1,
      );
      try {
        window.sessionStorage.setItem('tab_id', newTabId);
        window.localStorage.setItem('last_tab_id', newTabId);
      } catch (error) {
        // continue regardless of error
      }
      setTabId(newTabId);
    };
    let storedTabId;
    try {
      storedTabId = window.sessionStorage.getItem('tab_id');
    } catch (error) {
      // continue regardless of error
    }
    if (storedTabId) {
      channel.postMessage({
        type: 'REQUESTING_TAB_ID',
        tabId: storedTabId,
      });
      setTabId(storedTabId);
    } else {
      updateTabId();
    }

    channel.onmessage = messageEvent => {
      if (messageEvent.data.tabId === tabId) {
        if (messageEvent.data.type === 'REQUESTING_TAB_ID') {
          const message: TabIdChannelMessage = {
            type: 'TAB_ID_DENIED',
            tabId: messageEvent.data.tabId,
          };
          channel.postMessage(message);
        } else if (messageEvent.data.type === 'TAB_ID_DENIED') {
          updateTabId();
        }
      }
    };
  }, [tabId]);

  return tabId;
}

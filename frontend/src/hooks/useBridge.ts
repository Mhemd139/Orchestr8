import { useCallback, useEffect } from 'react';
import { BridgeMessage } from '@/types/bridge';

export const useBridge = () => {
  const sendMessage = useCallback((msg: BridgeMessage) => {
    console.log('[Bridge] Sending message:', msg);
    // Later: window.chrome?.webview?.postMessage(JSON.stringify(msg));
  }, []);

  const onMessage = useCallback((handler: (msg: BridgeMessage) => void) => {
    const messageHandler = (event: MessageEvent) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        handler(msg);
      } catch (error) {
        console.error('[Bridge] Failed to parse message:', error);
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  useEffect(() => {
    console.log('[Bridge] Hook initialized - ready for C# WebView2 integration');
  }, []);

  return { sendMessage, onMessage };
};

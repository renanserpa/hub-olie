// hub-initializer/services/logStreamService.ts

const logEmitter = new EventTarget();
const LOG_EVENT_NAME = 'crew-log';

/**
 * Broadcasts a log message to all listeners.
 * @param source The name of the agent or system emitting the log.
 * @param message The log message.
 */
export function sendLog(source: string, message: string) {
  const payload = JSON.stringify({ source, message });
  logEmitter.dispatchEvent(new CustomEvent(LOG_EVENT_NAME, { detail: payload }));
}

/**
 * Subscribes to the log stream, mimicking the EventSource API.
 * @param onMessage Callback function to handle incoming log messages.
 * @returns A stream object with a `close` method to unsubscribe.
 */
export function getCrewLogs(onMessage: (msg: string) => void) {
  const handleMessage = (event: Event) => {
    const customEvent = event as CustomEvent;
    const data = JSON.parse(customEvent.detail);
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    onMessage(`[${time}] [${data.source}] ${data.message}`);
  };

  logEmitter.addEventListener(LOG_EVENT_NAME, handleMessage);
  
  // Send initial connection message
  setTimeout(() => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    onMessage(`[${time}] [SYSTEM] Stream de logs iniciada...`);
  }, 100);

  return {
    close: () => {
      logEmitter.removeEventListener(LOG_EVENT_NAME, handleMessage);
      console.log("[MONITOR] Stream de logs fechada.");
    }
  };
}

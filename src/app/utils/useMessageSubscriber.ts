import { logger } from "core/utilities";

export type MessageListener = (data: object) => void;

let eventListenerRegistered: boolean = false;
let listenerIndex: number = 0;
const listeners: { [index: number]: MessageListener } = {};

const onMessage = (e: MessageEvent) => {
  for (const key in listeners) {
    const listener = listeners[key];
    try {
      listener(e.data);
    } catch (e) {
      logger("useMessageListener", `listener callback crashed for ${key}`)
    }
  }
};

const addListener = (listener: MessageListener): number => {
  logger("useMessageListener", "addListener");
  if (!eventListenerRegistered) {
    logger("useMessageListener", "registering aggregate listener");
    window.addEventListener("message", onMessage);
    eventListenerRegistered = true;
  }

  const id = listenerIndex++;
  listeners[id] = listener;

  return listenerIndex;
};
const removeListener = (listenerId: number) => {
  logger("useMessageListener", "removeListener");
  delete listeners[listenerId];

  if (Object.keys(listeners).length === 0 && eventListenerRegistered) {
    logger("useMessageListener", "deregistering aggregate listener");
    window.removeEventListener("message", onMessage);
    eventListenerRegistered = false;
  }
};

const subscriber = (listener: MessageListener): (() => void) => {
  const listenerId = addListener(listener);
  logger("useMessageListener", "subscriber", listenerId);
  return () => removeListener(listenerId);
};

const useMessageSubscriber = (): (listener: MessageListener) => (() => void) => {
  return subscriber;
};

export default useMessageSubscriber;

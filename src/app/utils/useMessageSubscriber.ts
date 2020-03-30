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
      console.log("useMessageListener", `listener callback crashed for ${key}`)
    }
  }
};

const addListener = (listener: MessageListener): number => {
  console.log("useMessageListener", "addListener");
  if (!eventListenerRegistered) {
    console.log("useMessageListener", "registering aggregate listener");
    window.addEventListener("message", onMessage);
    eventListenerRegistered = true;
  }

  const id = listenerIndex++;
  listeners[id] = listener;

  return listenerIndex;
};
const removeListener = (listenerId: number) => {
  console.log("useMessageListener", "removeListener");
  delete listeners[listenerId];

  if (Object.keys(listeners).length === 0 && eventListenerRegistered) {
    console.log("useMessageListener", "deregistering aggregate listener");
    window.removeEventListener("message", onMessage);
    eventListenerRegistered = false;
  }
};

const subscriber = (listener: MessageListener): (() => void) => {
  const listenerId = addListener(listener);
  console.log("useMessageListener", "subscriber", listenerId);
  return () => removeListener(listenerId);
};

export default (): (listener: MessageListener) => (() => void) => {
  return subscriber;
};
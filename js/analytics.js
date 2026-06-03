const STORAGE_KEY = 'lingoflow_analytics_v1';
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readStore(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { events: [] };
  }catch{
    return { events: [] };
  }
}

function writeStore(store){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }catch{
    // Analytics must never break LingoFlow.
  }
}

function deviceInfo(){
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    language: navigator.language
  };
}

export function track(eventName, payload = {}){
  const store = readStore();
  store.events.push({
    event: eventName,
    payload,
    sessionId: SESSION_ID,
    path: location.pathname,
    at: new Date().toISOString(),
    device: deviceInfo()
  });

  // Keep it light.
  if(store.events.length > 300){
    store.events = store.events.slice(-300);
  }

  writeStore(store);
}

export function getAnalyticsEvents(){
  return readStore().events || [];
}

export function clearAnalyticsEvents(){
  writeStore({ events: [] });
}

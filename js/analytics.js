const STORAGE_KEY = 'lingoflow_analytics_v1';

function getUserId() {
  let id = localStorage.getItem('lingoflow_user_id');

  if (!id) {
    id =
      'u_' +
      Date.now().toString(36) +
      '_' +
      Math.random().toString(36).slice(2, 10);

    localStorage.setItem('lingoflow_user_id', id);
  }

  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem('lingoflow_session_id');

  if (!id) {
    id =
      's_' +
      Date.now().toString(36) +
      '_' +
      Math.random().toString(36).slice(2, 10);

    sessionStorage.setItem('lingoflow_session_id', id);
  }

  return id;
}

export function track(event, payload = {}) {
  try {
    const data =
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        events: []
      };

    data.events.push({
      event,
      payload,
      userId: getUserId(),
      sessionId: getSessionId(),
      at: new Date().toISOString()
    });

    if (data.events.length > 5000) {
      data.events = data.events.slice(-5000);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Analytics error', err);
  }
}

export const Analytics = {
  track
};
const DEVICE_ID_KEY = 'anonymous_user_id';

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

export function setDeviceId(deviceId: string): void {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

export function clearDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function formatDeviceId(deviceId: string): string {
  return deviceId.toUpperCase();
}

export const CACHE_CONSTANTS = {
  USER: {
    BY_EMAIL: (email: string) => `user_by_email_${email.toLocaleLowerCase()}`,
    BY_ID: (id: string) => `user_by_id_${id}`,
  },
  DEVICE_POOL: {
    BY_SERIAL: (serial: string) =>
      `device_pool_by_serial_${serial.toLocaleUpperCase()}`,
    BY_ID: (id: string) => `device_pool_by_id_${id}`,
  },
  DEVICE: {
    BY_SERIAL: (serial: string) =>
      `device_by_serial_${serial.toLocaleUpperCase()}`,
    BY_ID: (id: string) => `device_by_id_${id}`,
  },
};

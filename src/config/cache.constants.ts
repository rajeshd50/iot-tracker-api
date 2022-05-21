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
  SITE_CONFIG: {
    BY_KEY: (key: string) => `site_config_by_key_${key.toLocaleLowerCase()}`,
    BY_ID: (id: string) => `site_config_by_id_${id}`,
    VALUE_BY_KEY: (key: string) =>
      `site_config_value_by_key_${key.toLocaleLowerCase()}`,
    ALL_AVAILABLE_KEYS: 'site_config_all_available_keys',
  },
};

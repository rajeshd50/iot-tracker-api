export enum SITE_CONFIG_TYPES {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATE_TIME = 'date-time',
}

export const UNLIMITED_NUMBER = -1;

export const SITE_CONFIG = {
  ADMIN_MAILING_LIST: {
    text: 'admin_mailing_list',
    type: SITE_CONFIG_TYPES.TEXT,
  },
  MAX_DEVICE_PER_USER: {
    text: 'max_device_per_user',
    type: SITE_CONFIG_TYPES.NUMBER,
  },
  MAX_GEO_FENCE_PER_DEVICE: {
    text: 'max_geo_fence_per_device',
    type: SITE_CONFIG_TYPES.NUMBER,
  },
  SUPPORT_MAILING_LIST: {
    text: 'support_mailing_list',
    type: SITE_CONFIG_TYPES.TEXT,
  },
  SOCIAL_LOGIN_ENABLED: {
    text: 'social_login_enabled',
    type: SITE_CONFIG_TYPES.BOOLEAN,
  },
  IS_USER_SITE_UNDER_MAINTENANCE: {
    text: 'is_user_site_under_maintenance',
    type: SITE_CONFIG_TYPES.BOOLEAN,
  },
  SITE_MAINTENANCE_MESSAGE: {
    text: 'site_maintenance_message',
    type: SITE_CONFIG_TYPES.TEXT,
  },
  BLACKLISTED_EMAILS: {
    text: 'blacklisted_emails',
    type: SITE_CONFIG_TYPES.TEXT,
  },
};

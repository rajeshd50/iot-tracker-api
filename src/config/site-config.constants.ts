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
    defaultValue: '',
    description:
      'When new device is added/registered by users, this list of email addresses will get notifications along with default admin emails',
    isMultipleEntry: true,
  },
  MAX_DEVICE_PER_USER: {
    text: 'max_device_per_user',
    type: SITE_CONFIG_TYPES.NUMBER,
    defaultValue: `${UNLIMITED_NUMBER}`,
    description:
      'Max number of device one user can add, -1 is unlimited. This settings is also available under user menu, precedence is user level > global',
    isMultipleEntry: false,
  },
  MAX_GEO_FENCE_PER_DEVICE: {
    text: 'max_geo_fence_per_device',
    type: SITE_CONFIG_TYPES.NUMBER,
    defaultValue: '50',
    description:
      'Max number of geo fence one user can add for any device, -1 is unlimited. This settings is also available under user menu as well as device menu, precedence is device level > user level > global',
    isMultipleEntry: false,
  },
  SUPPORT_MAILING_LIST: {
    text: 'support_mailing_list',
    type: SITE_CONFIG_TYPES.TEXT,
    defaultValue: '',
    description:
      'When new support request raised by users, this list of email addresses will get notifications along with default admin emails',
    isMultipleEntry: true,
  },
  SOCIAL_LOGIN_ENABLED: {
    text: 'social_login_enabled',
    type: SITE_CONFIG_TYPES.BOOLEAN,
    defaultValue: 'false',
    description: 'Enable social login and social connects',
    isMultipleEntry: false,
  },
  IS_USER_SITE_UNDER_MAINTENANCE: {
    text: 'is_user_site_under_maintenance',
    type: SITE_CONFIG_TYPES.BOOLEAN,
    defaultValue: 'false',
    description: 'If enable user will see maintenance page after login',
    isMultipleEntry: false,
  },
  IS_SITE_UNDER_MAINTENANCE: {
    text: 'is_site_under_maintenance',
    type: SITE_CONFIG_TYPES.BOOLEAN,
    defaultValue: 'false',
    description:
      'Whole site will be under maintenance, DO NOT use this unless verified',
    isMultipleEntry: false,
  },
  SITE_MAINTENANCE_MESSAGE: {
    text: 'site_maintenance_message',
    type: SITE_CONFIG_TYPES.TEXT,
    defaultValue: '',
    description: 'message to show when site is under maintenance',
    isMultipleEntry: false,
  },
  BLACKLISTED_EMAILS: {
    text: 'blacklisted_emails',
    type: SITE_CONFIG_TYPES.TEXT,
    defaultValue: '',
    description:
      'This emails will be blacklisted, they will not be able to login',
    isMultipleEntry: true,
  },
};

export const QUEUE_CONSTANTS = {
  USER_SERVICE_QUEUE: {
    NAME: 'user_service_queue',
    TASKS: {
      SEND_PASSWORD_RESET_EMAIL: 'user_send_password_reset_email',
      SEND_EMAIL_VERIFY_EMAIL: 'user_send_email_verify_email',
      SEND_WELCOME_EMAIL: 'user_send_welcome_email',
    },
  },
  DEVICE_SERVICE_QUEUE: {
    NAME: 'device_service_queue',
    TASKS: {
      APPROVAL_REQUEST_EMAIL: 'device_send_approval_request_email',
      APPROVAL_REJECTED_EMAIL: 'device_send_approval_rejected_email',
      APPROVAL_ACCEPTED_EMAIL: 'device_send_approval_accepted_email',
      DEVICE_ADDED_TO_ACCOUNT: 'device_added_to_account_email',
    },
  },
};

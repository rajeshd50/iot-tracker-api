export const CACHE_CONSTANTS = {
  USER: {
    BY_EMAIL: (email: string) => `user_by_email_${email.toLowerCase()}`,
    BY_ID: (id: string) => `user_by_id_${id}`,
  },
};

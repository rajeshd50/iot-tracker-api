import { format } from 'date-fns';
import { customAlphabet } from 'nanoid';
import { SERIAL_PREFIX } from 'src/config';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

const getRandomIdByDate = () => {
  const formattedDateString = format(new Date(), 'yy/dd/MM/ss/mm/HH')
    .split('/')
    .join('');
  return parseInt(formattedDateString).toString(16);
};

export const getUniqueDeviceSerialNumber = () => {
  return `${SERIAL_PREFIX}-${getRandomIdByDate()}-${nanoid()}-${nanoid()}`;
};

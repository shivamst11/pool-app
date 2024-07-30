import apiCallWrapper from '../../shared/network/apiCallWrapper';
import { axios_instance } from '../../shared/network/network';
import URL from '../authentication/constants/url';

export const login = ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  return apiCallWrapper(async () => {
    const { data } = await axios_instance.post(URL.LOGIN, {
      username,
      password,
    });

    return data;
  });
};

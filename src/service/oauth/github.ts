import axios from 'axios';

//get github token with async http request.
const getTokenFromGithub = (code: string) => {
  const url = "https://github.com/login/oauth/access_token";
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID as string,
    client_secret: process.env
      .GITHUB_CLIENT_SECRET as string,
    code: code,
  };
  const qs = new URLSearchParams(options);
  return axios.post(url, qs, { headers: { 'Accept': 'application/json' } }).then(token => {
    console.log(token.status);
    if (token.status === 200) {
      console.log(token.data);
      const { access_token, token_type, scope } = token.data;
      return Promise.resolve(access_token as string);
    }
    else
      return Promise.reject(new Error(`502 ${token.data.get('error')}`));
  })
}

export { getTokenFromGithub }
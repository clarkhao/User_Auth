import axios from 'axios';

//get github token with async http request.
const getTokenFromGoogle = (code: string) => {
  const url = "https://oauth2.googleapis.com/token";
  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL as string,
    grant_type: 'authorization_code',
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

export { getTokenFromGoogle };
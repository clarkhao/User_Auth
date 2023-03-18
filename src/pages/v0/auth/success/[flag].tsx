//应用模块
import React, {Fragment} from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps, NextPage } from "next";
import {readI18nFiles} from 'src/utils';
//style和主题

//组件
import Success from 'src/component/composite/auth/Success';
import CardLayout from 'src/component/layout/CardLayout';
//hooks
import {useLoginStore} from 'src/store';

interface SuccessProps {
  i18n: {[key: string]: string};
}

const SuccessPage: NextPage<SuccessProps> = (props) => {
  const router = useRouter();
  const {flag} = router.query;
  const signin = useLoginStore((state) => state.login);
  const toggleLogin = useLoginStore((state) => state.toggleLogin);
  React.useEffect(() => {
    if(flag === 'signin') {
      window.fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/v0/auth/oauth`, {
        method: 'GET'
      }).then(async response => {
        if(response.status === 200) {
          const data = await response.json();
          console.log(data);
          window.localStorage.setItem('token', data.token);
          //router.push(data.originalUrl);
          toggleLogin(true);
        } else {
          console.error(await response.json());
        }
      }).catch(err => {
        //router.push(custom error page);
      })
    }
  }, [])
  React.useEffect(() => {
    console.log('you are signed in')
  }, [signin])
  return <>
    <CardLayout childrend={<Success content={props.i18n} isSignup={flag === 'signup'}/>}/>
  </>
}

export async function getStaticPaths() {
  const singupPaths = ['cn', 'en', 'jp'].map(v => ({
    params: {flag: 'signup'}, locale: v
  }))
  const singinPaths = ['cn', 'en', 'jp'].map(v => ({
    params: {flag: 'signin'}, locale: v
  }))
  const paths = [...singupPaths, ...singinPaths];
  return {
    paths, fallback: false
  }
}
export const getStaticProps: GetStaticProps<SuccessProps> = async (context) => {
  const flag = context.params?.flag as string;
  const fileName = (__filename.split("/").reverse()[1] as string).concat(`_${flag}`);
  console.log(fileName);
  const i18n = await readI18nFiles(context, fileName) as {[key: string]: string};
  return {
    props: {
      i18n
    }
  };
}

export default SuccessPage;
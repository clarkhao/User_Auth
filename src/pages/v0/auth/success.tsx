//应用模块
import React, {Fragment} from 'react';
import { useRouter } from 'next/router';
//style和主题

//组件
import Success from 'src/component/composite/auth/Success';
import CardLayout from 'src/component/layout/CardLayout';
import axios from 'axios';

function SuccessPage() {
  const router = useRouter();
  React.useEffect(() => {
    axios('http://localhost:3000/api/v0/auth/oauth', {
      method: 'get',
      withCredentials: true
    })
  }, [router])
  return <>
    <CardLayout childrend={<Success content={{'':''}}/>}/>
  </>
}

export default SuccessPage;
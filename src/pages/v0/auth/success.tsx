//应用模块
import React, {Fragment} from 'react';
//style和主题

//组件
import Success from 'src/component/composite/auth/Success';
import CardLayout from 'src/component/layout/CardLayout';

function SuccessPage() {
  return <>
    <CardLayout childrend={<Success content={{'':''}}/>}/>
  </>
}

export default SuccessPage;
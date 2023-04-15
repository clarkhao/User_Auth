//应用模块
import React, { Fragment } from "react";
import type { GetStaticProps, NextPage } from "next";
import { readI18nFiles } from "src/utils";
//style和主题
import style from "./signin.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import SigninLeft from "src/component/composite/auth/SigninLeft";
import SigninRight from "src/component/composite/auth/SigninRight";
import LeftRight from "src/component/layout/LeftRight";
//type
import type { SideSign, Signup } from "src/component/utils";

interface SignupProps {
  i18n: Signup;
}

const SigninPage: NextPage<SignupProps> = (props) => {
  const theme = useTheme();
  return (
    <div className={style.container} css={css`
    --signin-page-bg: ${theme.palette.background.default};
  `}>
      <LeftRight
        left={<SigninLeft i18n={props.i18n.left}/>}
        right={<SigninRight i18n={props.i18n.right}/>}
        height="80%"
        keepLeft={true}
      />
    </div>
  );
}
export const getStaticProps: GetStaticProps<SignupProps> = async (context) => {
  const fileName = (__filename.split("/").reverse()[0] as string).split(".")[0];
  const i18n = await readI18nFiles(context, fileName) as Signup;
  if(!i18n) {
    return {
      notFound: true
    }
  }
  return {
    props: {
      i18n
    }
  };
};


export default SigninPage;
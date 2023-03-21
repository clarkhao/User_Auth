//应用模块
import React, { Fragment } from "react";
import type { GetStaticProps, NextPage } from "next";
import {readI18nFiles} from 'src/utils';
//style和主题
import style from "./signup.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import SignupLeft from "src/component/composite/auth/SignupLeft";
import SignupRight from "src/component/composite/auth/SignupRight";
import LeftRight from "src/component/layout/LeftRight";
import { useRouter } from "next/router";
import ThemeI18n from "src/component/composite/ThemeI18n";
//type
import type { SideSign, Signup } from "src/component/utils";

interface SignupProps {
  i18n: Signup;
}

const SignupPage: NextPage<SignupProps> = (props) => {
  const theme = useTheme();
  return (
    <div
      className={style.container}
      css={css`
        --signup-page-bg: ${theme.palette.background.default};
      `}
    >
      <ThemeI18n size="60px" />
      <LeftRight
        left={<SignupLeft i18n={props.i18n.left} />}
        right={<SignupRight i18n={props.i18n.right} />}
      />
    </div>
  );
};

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

export default SignupPage;
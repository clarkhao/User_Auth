//应用模块
import React, { Fragment } from "react";
import fs from "fs";
import path from "path";
import type { GetStaticProps, NextPage } from "next";
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
import type { SideSignup, Signup } from "src/component/utils";

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
  const i18nDir = path.join(process.cwd(), "/public/locales");
  const fileName = (__filename.split("/").reverse()[0] as string).split(".")[0];
  const filePath = path.join(i18nDir, `/${context.locale}/${fileName}.json`);
  console.log(filePath);
  let i18n: Signup = { left: {}, right: {} };
  try {
    let data = '';
    const stream = fs.createReadStream(filePath, {encoding: 'utf-8'});
    i18n = await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        data += chunk;
      })
      stream.on('end', () => {
        resolve(JSON.parse(data));
      })
      stream.on('error', (err) => {
        throw new Error(err.stack);
      })
    })
  } catch (err) {
    console.error(`Error reading file: ${err}`);
  }
  return {
    props: {
      i18n
    }
  };
};

export default SignupPage;
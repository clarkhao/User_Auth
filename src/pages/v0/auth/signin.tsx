//应用模块
import React, { Fragment } from "react";
import type { GetStaticProps, NextPage } from "next";
import { readI18nFiles } from "src/utils";
//style和主题
import style from "./signup.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import SigninLeft from "src/component/composite/auth/SigninLeft";
import SigninRight from "src/component/composite/auth/SigninRight";
import LeftRight from "src/component/layout/LeftRight";
//type
import type { SideSign, Signup } from "src/component/utils";

function Signin() {
  return (
    <div className={style.container}>
      <LeftRight
        left={<SigninLeft />}
        right={<SigninRight />}
        height="80%"
        keepLeft={true}
      />
    </div>
  );
}

export default Signin;

//应用模块
import React, { Fragment } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
//style
import style from "./SigninRight.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Button from "@mui/material/Button";
import Link from "next/link";
//type
import { SideSign } from "../../utils";

type TSigninRight = {
  /**
   * url for lottie file
   */
  src?: string;
  /**
   * i18n data
   */
  i18n?: SideSign;
};

function SigninRight({ i18n, src, ...props }: TSigninRight) {
  const theme = useTheme();
  return (
    <div
      className={style.container}
      css={css`
        --signin-right-bg: ${theme.palette.mode === "light"
          ? theme.palette.primary.dark
          : "#11508f"};
        --signin-right-bottom-bg: ${theme.palette.mode === "light"
          ? "white"
          : theme.palette.secondary.main};
        --signin-right-shadow: ${theme.shadows[4]};
      `}
    >
      <header>
        <h2>{"还没有账户？去注册"}</h2>
      </header>
      <main>
        <Player
          autoplay
          loop
          hover
          src={
            src ?? "https://assets2.lottiefiles.com/packages/lf20_vyutxyym.json"
          }
          className="player"
        />
      </main>
      <Button variant="contained" fullWidth color="secondary">
        <Link href="/v0/auth/signup">{i18n?.submit ?? "注册"}</Link>
      </Button>
    </div>
  );
}

export default SigninRight;

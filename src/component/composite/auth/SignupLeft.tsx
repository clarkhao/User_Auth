//应用模块
import React, { Fragment } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import {JsonValue} from '../../utils';
//style
import style from "./SignupLeft.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Mark from "../../ui/MarkUI";
//type
import {SideSign} from '../../utils';

type TSignupLeft = {
  /**
   * url for lottie file
   */
  src?: string;
  /**
   * i18n data
   */
  i18n?: SideSign;
};

function SignupLeft({ src, i18n, ...props }: TSignupLeft) {
  const theme = useTheme();
  return (
    <div
      className={style.container}
      css={css`
        --signup-left-bg: ${theme.palette.mode === "light"
          ? theme.palette.primary.dark
          : '#11508f'};
        --signup-left-bottom-bg: ${theme.palette.mode === "light"
          ? "white"
          : theme.palette.secondary.main};
        --signup-left-font-color: ${theme.palette.primary.contrastText};
        --signup-left-shadow: ${theme.shadows[4]};
      `}
    >
      <div>
        <Mark size={50} />
        <h2>{i18n?.title ?? '与全球宠物爱好者连接'}</h2>
        <p>{i18n?.paragraph ?? '探索宠物生活的乐趣，与全球宠物爱好者分享你的独特故事。在这里，你可以和宠物一起享受美好的生活，还可以发现各种关于宠物的好玩、有趣的事情。'}</p>
      </div>
      <div className={style.animate}>
        <Player
          autoplay
          loop
          hover
          src={
            src ?? "https://assets6.lottiefiles.com/packages/lf20_whqxjuqz.json"
          }
          className="player"
        />
      </div>
    </div>
  );
}

export default SignupLeft;

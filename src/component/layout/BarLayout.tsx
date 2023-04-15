//应用
import React from "react";
//style
import style from "./BarLayout.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { Left, Right } from "../composite/BarElements";

type BarType = {
  /**
   * left component
   */
  left: React.ReactNode;
  /**
   * right component
   */
  right: React.ReactNode;
};
function BarLayout({ left = <Left />, right = <Right />, ...props }: BarType) {
  const theme = useTheme();
  return (
    <div
      className={style.container}
      css={css`
        --header-bar-bg: ${theme.palette.warning.light};
      `}
    >
      {left}
      {right}
    </div>
  );
}

export default BarLayout;

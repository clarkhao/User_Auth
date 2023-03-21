//应用
import React, { Fragment } from "react";
//style
import style from "./LeftRight.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

type TLeftRight = {
  /**
   * children from left
   */
  left: React.ReactNode;
  /**
   * children from right
   */
  right: React.ReactNode;
  /**
   * height
   */
  height?: string;
  /**
   * make one side disapper when screen width smaller than xx
   * which side?
   */
  keepLeft?: boolean;
};

function LeftRight({ left, right, keepLeft=false ,...props }: TLeftRight) {
  return (
    <div
      className={keepLeft ? style.left_container : style.right_container}
      id="signup-card"
      css={css`
        --left-right-layout-height: ${props.height || '90%'};
      `}
    >
      {left}
      {right}
    </div>
  );
}

export default LeftRight;

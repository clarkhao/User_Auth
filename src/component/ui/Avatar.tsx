//应用
import React, { useRef } from "react";
//style
import style from "./Avatar.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件

type TAvatar = {
  /**
   * size
   */
  size: number;
  /**
   * children
   */
  children?: React.ReactNode;
  /**
   * handleClick?
   */
  handleClick?: (e: React.MouseEvent) => void;
  /**
   * id
   */
  id?: string;
};

function Avatar({ size = 100, ...props }: TAvatar) {
  return (
    <>
      <div
        id={props.id}
        className={style.container}
        onClick={props.handleClick}
        css={css`
          --avatar-icon-size: ${size}px;
          --avatar-icon-image: url(https://api.lorem.space/image/face?w=${size}&h=${size});
        `}
      >
        {props.children}
      </div>
    </>
  );
}

function AvatarSkeleton({ size }: { size: number }) {
  return (
    <>
      <div
        className="skeleton"
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: `50%` }}
      ></div>
    </>
  );
}

export default Avatar;

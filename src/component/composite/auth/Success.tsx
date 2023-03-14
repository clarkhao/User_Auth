//应用模块
import React, { Fragment } from "react";
//style
import style from "./Success.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Complete from "../../ui/Complete";
import Button from "@mui/material/Button";

type TSuccess = {
  /**
   * text content
   */
  content: { [key: string]: string };
};

function Success({ content, ...props }: TSuccess) {
  return (
    <div className={style.container}>
      <Complete size="180px" />
      <h3>注册成功</h3>
      <div className={style.content}>
        <div>现在可以登陆您的账户</div>
        <Button variant="contained" color="success">
          登陆
        </Button>
      </div>
    </div>
  );
}

export default Success;
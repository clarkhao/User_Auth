//应用
import React from "react";
//style
import style from "./SwitchUI.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { FiSun, FiMoon } from "react-icons/fi";

type SwitchType = {
  /**
   * parent handler
   */
  handleClick?: React.MouseEventHandler;
  /**
   * toggle indicate boolean
   */
  toggle?: boolean;
  /**
   * is svg icon needed?
   */
  isSvg?: boolean;
  /**
   * size
   */
  size?: number;
};

function Switch({ isSvg = true, size = 100, ...props }: SwitchType) {
  const theme = useTheme();
  const id = React.useId();
  const [toggle, setToggle] = React.useState(false);
  const handleToggle = (e: React.MouseEvent) => {
    setToggle(!toggle);
  };
  return (
    <>
      <input className={style.input} type="checkbox" id={id} />
      <label
        className={style.label}
        htmlFor={id}
        onClick={props.handleClick ?? handleToggle}
        css={css`
          --switch-bg: ${props.toggle ?? toggle
            ? "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)"
            : "linear-gradient(to bottom, #4facfe, #00f2fe)"};
          --switch-btn-color: ${props.toggle ?? toggle ? "#003" : "white"};
          --toggle-size: ${size}px;
          --toggle-box-shadow: ${theme.shadows[4]};
        `}
      >
        <span className={style.toggle}>
          {isSvg ? props.toggle ?? toggle ? <FiMoon /> : <FiSun /> : null}
        </span>
      </label>
    </>
  );
}

export default Switch;

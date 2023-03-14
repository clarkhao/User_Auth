//应用
import React, { useRef } from "react";
//style
import style from "./Complete.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { CSSTransition } from "react-transition-group";
import { FiCheck } from "react-icons/fi";
//hooks

type IComplete = {
  /**
   * size
   */
  size: string;
};

function Complete({ size = "150px", ...props }: IComplete) {
  const theme = useTheme();
  const [progress, setProgress] = React.useState(0);
  const [rate, setRate] = React.useState(1);
  const [stop, setStop] = React.useState(0);
  const outerRef = useRef(null);
  const [inProp, setInProp] = React.useState(false);
  const [svg, setSvg] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = window.setTimeout(() => {
        setInProp(true);
      }, 500);
      setStop(timer);
      return () => clearTimeout(timer);
    } else {
      console.log("no such effect");
    }
  }, []);
    
  return (
    <div
      className={style.container}
      css={css`
        --success-bg: ${theme.palette.success.light};
        --success-inner-bg: ${theme.palette.background.default};
        --success-size: ${size};
      `}
    >
      <CSSTransition
        nodeRef={outerRef}
        in={inProp}
        timeout={1000}
        classNames="success"
        onEntered={() => {
          setInProp(false);
          setSvg(true);
        }}
      >
        <div className={style.outer} ref={outerRef}>
          <div className={[style.inner, "inner"].join(" ")}>
            {svg ? <FiCheck /> : null}
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

export default Complete;

//应用
import React, { Fragment } from "react";
import { useRouter } from "next/router";
//style
import style from "./Select.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { FiGlobe } from "react-icons/fi";
import Menu from "./Menu";

type TSelect = {
  /**
   * size
   */
  size?: number;
};

function Select({ size = 50, ...props }: TSelect) {
  const theme = useTheme();
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const [inProp, setInProp] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    setInProp(!inProp);
  };
  const handleElement = (v: string) => {
    router.push({ pathname, query }, asPath, { locale: v });
    setInProp(false);
  };
  React.useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      const dropdown = document.querySelector("#i18n-show");
      const button = document.querySelector("#i18n-btn") as Node;
      if (dropdown && !button.contains(e.target as Node)) {
        setInProp(false);
      }
    };
    window.addEventListener("click", mouseHandler);
    return () => {
      window.removeEventListener("click", mouseHandler);
    };
  }, []);
  return (
    <div
      id="i18n-btn"
      className={style.btn}
      onClick={handleSelect}
      css={css`
        --select-size: ${size}px;
        --i18n-button-bg: ${theme.palette.grey[500]};
        --select-text-color: ${theme.palette.primary.contrastText};
        --select-box-shadow: ${theme.shadows[4]};
      `}
    >
      <FiGlobe />
      <span className={style.title}>{locale?.toUpperCase() ?? "CN"}</span>
      <Menu
        id="i18n-show"
        isShown={inProp}
        handleElement={handleElement}
        content={["cn", "en", "jp"]}
        offset={-(100-size)/2}
      />
    </div>
  );
}

export default Select;

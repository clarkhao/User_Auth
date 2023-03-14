//应用
import React, { Fragment } from "react";
import { useRouter } from 'next/router';
//style
import style from "./Select.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { FiGlobe } from "react-icons/fi";

type TSelect = {
  /**
   * size
   */
  size?: string;
};
const i18nMap: {[key:string]: string} = {
  'CN': 'cn',
  'EN': 'en',
  'JP': 'jp'
}

function Select({ size = "100px", ...props }: TSelect) {
  const theme = useTheme();
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const [inProp, setInProp] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    setInProp(!inProp);
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
      id='i18n-btn'
      className={style.btn}
      onClick={handleSelect}
      css={css`
        --select-size: ${size};
        --i18n-button-bg: ${theme.palette.grey[500]};
        --select-text-color: ${theme.palette.primary.contrastText};
        --select-box-shadow: ${theme.shadows[4]};
      `}
    >
      <FiGlobe />
      <span className={style.title}>{locale?.toUpperCase() ?? 'CN'}</span>
      <ul
        id='i18n-show'
        className={[style.drop_down_content, inProp ? style.show : ''].join(' ')}
      >
        {["CN", "EN", "JP"].map((v, i) => (
          <li
            key={`i18n-${i}`}
            onClick={(e) => {
              e.preventDefault;
              e.stopPropagation();
              router.push({ pathname, query }, asPath, { locale: i18nMap[v] })
              setInProp(false);
            }}
          >
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Select;

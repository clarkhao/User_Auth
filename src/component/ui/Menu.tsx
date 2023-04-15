//应用
import React, { useRef } from "react";
//style
import style from "./Menu.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件

type TMenu = {
  /**
   * isShown
   */
  isShown: boolean;
  /**
   *
   */
  handleElement: (el: string) => void;
  /**
   * content
   */
  content: Array<string>;
  /**
   * id
   */
  id: string;
  /**
   * offset
   */
  offset?: number;
};

function Menu({
  isShown = true,
  handleElement,
  content = ["cn", "en", "jp"],
  ...props
}: TMenu) {
  return (
    <div className={style.container}>
      <ul
        id={props.id}
        className={[style.drop_down_content, isShown ? style.show : ""].join(
          " "
        )}
        css={css`--menu-absolute-offset: ${props.offset}px`}
      >
        {content.map((v, i) => (
          <li
            key={`menu-item-${i}`}
            onClick={(e) => {
              e.preventDefault;
              e.stopPropagation();
              handleElement(v);
            }}
          >
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Menu;

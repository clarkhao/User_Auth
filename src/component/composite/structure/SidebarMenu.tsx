//应用
import React, { useRef } from "react";
//style
import style from "./SidebarMenu.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
//hooks
import { profileContext } from "../../../pages/v0/profile";

type TSidebarMenu = {
  /**
   * isHidden
   */
  isShown: boolean;
};

function SidebarMenu({ isShown = false, ...props }: TSidebarMenu) {
  const theme = useTheme();
  const context = React.useContext(profileContext);

  return (
    <aside
      className={[style.container, context?.sidebar ? "" : style.hide].join(
        " "
      )}
      css={css`
        --sidebar-menu-bg-color: ${theme.palette.mode === "dark"
          ? theme.palette.grey[900]
          : theme.palette.grey[200]};
        --sidebar-menu-font-color: ${theme.palette.mode === "dark" ? 'white': 'black'}
      `}
    >
      <main className={style.main}>
        <ul>
          {new Array(10).fill("Menu Item").map((v, i) => (
            <li key={`sidebar-item-${i}`}>{v}</li>
          ))}
        </ul>
      </main>
    </aside>
  );
}

export default SidebarMenu;

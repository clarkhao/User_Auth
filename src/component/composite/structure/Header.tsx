//应用
import React, { useRef } from "react";
//style
import style from "./Header.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import ThemeI18n from "../ThemeI18n";
import AvatarSelect from "../../ui/AvatarSelect";
import Mark from "../../ui/MarkUI";
import { FiMenu } from "react-icons/fi";
import IconButton from "@mui/material/IconButton";
import BarLayout from "../../layout/BarLayout";
//hooks
import {profileContext} from '../../../pages/v0/profile';

type THeader = {};

function Header({ ...props }: THeader) {
  const theme = useTheme();
  const context = React.useContext(profileContext);
  return (
    <BarLayout
      left={
        <div className={style.left}>
          <IconButton onClick={() => {context?.toggleSidebar()}}>
            <FiMenu />
          </IconButton>
          <Mark size={40} />
        </div>
      }
      right={<ThemeI18n size={60} hasAvatar={true} />}
    />
  );
}

export default Header;

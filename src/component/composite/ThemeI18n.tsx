//应用
import React from "react";
import { useThemeStore } from "../../store";
//style
import style from "./ThemeI18n.module.css";
import { lightTheme, darkTheme } from "../utils";
//组件
import Switch from "../ui/SwitchUI";
import Select from "../ui/Select";
import AvatarSelect from "../ui/AvatarSelect";

type TThemeI18nLayout = {
  /**
   * left
   */
  left: React.ReactNode;
  /**
   * right
   */
  right: React.ReactNode;
  /**
   * avatar?
   */
  avatar?: React.ReactNode;
};
type TThemeI18n = {
  /**
   * size
   */
  size: number;
  /**
   * hasAvatar?
   */
  hasAvatar?: boolean;
};

function ThemeI18nLayout({ left, right, ...props }: TThemeI18nLayout) {
  return (
    <div className={style.container}>
      {left}
      {right}
      {props.avatar}
    </div>
  );
}
function ThemeI18n({ size, hasAvatar = false, ...props }: TThemeI18n) {
  const [toggle, setToggle] = React.useState(false);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const handleClick = (e: React.MouseEvent) => {
    setToggle(!toggle);
    if (toggle) toggleTheme(lightTheme);
    else toggleTheme(darkTheme);
  };
  return (
    <>
      <ThemeI18nLayout
        left={<Switch size={size} handleClick={handleClick} toggle={toggle} />}
        right={<Select size={size} />}
        avatar={hasAvatar ? <AvatarSelect size={size - 20} /> : null}
      />
    </>
  );
}

export default ThemeI18n;

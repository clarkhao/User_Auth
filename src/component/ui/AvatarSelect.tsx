//应用
import React, { useRef } from "react";
//style
import style from "./Avatar.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import Avatar from "./Avatar";
import Menu from "./Menu";
import { useRouter } from "next/router";

type TAvatarSelect = {
  /**
   * size
   */
  size: number;
};

function AvatarSelect({ size = 50, ...props }: TAvatarSelect) {
  const [click, setClick] = React.useState(false);
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClick(!click);
  };
  const handleElement = (el: string) => {
    router.push(`/v0/${el.toLowerCase()}`);
    setClick(false);
  };
  React.useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      const dropdown = document.querySelector("#avatar-menu");
      const button = document.querySelector("#avatar-icon") as Node;
      if (dropdown && !button.contains(e.target as Node)) {
        setClick(false);
      }
    };
    window.addEventListener("click", mouseHandler);
    return () => {
      window.removeEventListener("click", mouseHandler);
    };
  }, []);
  return (
    <>
      <Avatar id="avatar-icon" size={size} handleClick={handleClick}>
        <Menu
          id="avatar-menu"
          isShown={click}
          handleElement={handleElement}
          content={["Profile", "Logout"]}
        />
      </Avatar>
    </>
  );
}

export default AvatarSelect;

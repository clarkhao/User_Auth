//应用
import React, { Fragment } from "react";
import { fecthMasonry } from "../utils";
//style
import style from "./Arrangement.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import PostCard from "../ui/PostCard";
//hooks
import { profileContext } from "../../pages/v0/profile";

type TArrangement = {
  /**
   * width
   */
  width: number;
  /**
   * renderList
   */
  renderList: Array<{ [key: string]: string }>;
  /**
   *
   */
};

function Arrangement({ width = 300, ...props }: TArrangement) {
  const context = React.useContext(profileContext);
  const [renderWidth, setRenderWidth] = React.useState<number>(600);
  React.useEffect(() => {
    const handleResize = () => {
      console.log(`Element width is ${window.innerWidth}`);
      setRenderWidth(window.innerWidth - 200);
    };
    handleResize(); // get initial width
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  React.useEffect(() => {
    const element = document.getElementsByClassName(
      "masonry-layout"
    )[0] as HTMLDivElement;
    if (context?.sidebar === true)
      setRenderWidth(window.innerWidth - 200 - 250);
    else setRenderWidth(window.innerWidth - 200);
    console.log(`Element width is ${window.innerWidth}`);
  }, [context?.sidebar]);
  React.useEffect(() => {
    fecthMasonry("masonry", "sub", Math.floor(renderWidth / (width + 35)));
  }, [renderWidth]);
  return (
    <div className="masonry-layout">
      <div id="masonry">
        {props.renderList.map((el, index) => (
          <div className="sub" key={`post_id_${index}`}>
            <PostCard size={width} data={el} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Arrangement;

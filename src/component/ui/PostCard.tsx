//应用
import React, { useRef, Suspense } from "react";
//style
import style from "./PostCard.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import CardLayout from "../layout/CardLayout";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
const Avatar = React.lazy(() => import("./Avatar"));

type TPostCardData = {
  [key: string]: string;
};
type TPostCard = {
  /**
   * size
   */
  size: number;
  /**
   * data from parent
   */
  data?: TPostCardData;
};

function PostCardSkeleton({
  size,
  height,
  display,
}: {
  size: number;
  height?: number;
  display?: boolean;
}) {
  return (
    <div
      className={["skeleton", display ? "display" : "disappear"].join(" ")}
      css={css`
        --image-skeleton-width: ${size}px;
        --image-skeleton-height: ${height}px;
      `}
    ></div>
  );
}

function PostCard({ size = 300, data, ...props }: TPostCard) {
  const theme = useTheme();
  const [isLoading, setLoaded] = React.useState(true);
  const [height, setHeight] = React.useState(size);
  return (
    <>
      <CardLayout height="auto" width={`${size}px`}>
        <div className={isLoading ? style.image : ""}>
          <PostCardSkeleton
            size={size}
            height={height}
            display={data === undefined || isLoading}
          />
          <img
            className={
              data === undefined || isLoading ? style.none : style.visible
            }
            src={data?.image}
            alt="cat"
            width={size}
            height="auto"
            loading="lazy"
            decoding="auto"
            crossOrigin="anonymous"
            onLoad={(e) => {
              setLoaded(false);
            }}
            onLoadStart={(e) => {
              setHeight((e.target as HTMLImageElement).height);
            }}
            onError={(e) => {
              console.log('oops errors')
              console.log(e.target);
            }}
          />
        </div>
        <div
          className={style.caption}
          css={css`
            --profile-text-color: ${theme.palette.text.primary};
          `}
        >
          {data?.words !== "" ? (
            data?.words
          ) : (
            <div
              className="skeleton"
              style={{ width: `${size}px`, height: `20px` }}
            ></div>
          )}
          <footer className={style.footer}>
            <div className={style.avarta}>
              <Avatar size={40} />
              <p>Clark</p>
            </div>
            <div className={style.avarta}>
              <FiHeart />
              <p>{data?.likes}</p>
            </div>
          </footer>
        </div>
      </CardLayout>
    </>
  );
}

export default PostCard;

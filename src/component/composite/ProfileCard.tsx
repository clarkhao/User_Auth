//应用
import React, { useRef } from "react";
//style
import style from "./ProfileCard.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import Avatar from "../ui/Avatar";
import CardLayout from "../layout/CardLayout";
import Follower from "../ui/Follower";
import Button from "@mui/material/Button";

type TProfileCard = {
  /**
   * userinfo
   */
};

function ProfileCard({ ...props }: TProfileCard) {
  const theme = useTheme();
  return (
    <CardLayout height="100%" width="300px">
      {<Avatar size={200} id="card-avatar" />}
      <div className={style.main} css={css`
        --profile-text-color: ${theme.palette.text.primary};
      `}>
        <div className={style.header}>
          <div className={style.name}>
            <h3>Clark</h3>
            <p>@clarkhao</p>
          </div>
          <Button>Edit</Button>
        </div>
        <div className={style.icons}>
          {[
            { name: "Followers", value: Math.floor(Math.random() * 1000) + 20 },
            {
              name: "Followings",
              value: Math.floor(Math.random() * 1000) + 20,
            },
            {
              name: "Likes",
              value: Math.floor(Math.random() * 1000) + 20,
            },
          ].map((v, i) => (
            <Follower size={60} data={v} key={`follow_button_${i}`} />
          ))}
        </div>
        <p>bio</p>
      </div>
    </CardLayout>
  );
}

export default ProfileCard;

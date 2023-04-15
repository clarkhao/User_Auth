//应用模块
import React, { Fragment } from "react";
import { GetServerSideProps } from "next";
import { readI18nFiles } from "src/utils";
import { InferGetServerSidePropsType } from "next";
//style和主题
import style from "./index.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Header from "src/component/composite/structure/Header";
import SidebarMenu from "src/component/composite/structure/SidebarMenu";
import ProfileCard from "src/component/composite/ProfileCard";
import Arrangement from "src/component/layout/Arrangement";

type Data = Array<{ [key: string]: string }>;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const res = await Promise.all(
    [
      "https://192.168.3.55:3000/posts.json",
    ].map(async (url) => await fetch(url))
  );
  const data = await res[0].json();
  console.log(data);
  return {
    props: {
      data,
    },
  };
};
type TProfileState = {
  sidebar: boolean;
};
type TProfilePayload = {
  "toggle-sidebar": boolean;
};
interface IProfileAction {
  type: keyof TProfilePayload;
  payload: TProfilePayload[IProfileAction["type"]] | null;
}
const profileReducer = (state: TProfileState, action: IProfileAction) => {
  switch (action.type) {
    case "toggle-sidebar":
      return { ...state, sidebar: !state.sidebar };
    default:
      return { ...state };
  }
};
const initProfileState: TProfileState = {
  sidebar: false,
};
type TValueType = {
  sidebar: boolean;
  toggleSidebar: () => void;
};
export const profileContext = React.createContext<TValueType | null>(null);
function ProfilePage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const theme = useTheme();
  const [state, dispatch] = React.useReducer(profileReducer, initProfileState);
  const value: TValueType = {
    sidebar: state.sidebar,
    toggleSidebar: () => {
      dispatch({ type: "toggle-sidebar", payload: null });
    },
  };
  return (
    <profileContext.Provider value={value}>
      <div className={style.container} css={css`
          --profile-bg-color: ${theme.palette.background.default}
        `}>
        <Header />
        <main className={style.main}>
          <SidebarMenu isShown={false} />
          <div className={[style.display, value.sidebar ? style.indent : ''].join(' ')}>
            <ProfileCard />
            <Arrangement width={250} renderList={data} />
          </div>
        </main>
      </div>
    </profileContext.Provider>
  );
}
export default ProfilePage;

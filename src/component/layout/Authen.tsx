//应用
import React, { Fragment } from "react";
//style
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import PostCard from "../ui/PostCard";
//hooks
import { useLoginStore } from "src/store";
import { useRouter } from "next/router";

type TAuthen = {
  /**
   * children
   */
  children: React.ReactNode;
};

function Authentication({ ...props }: TAuthen) {
  const signin = useLoginStore((state) => state.login);
  const toggleLogin = useLoginStore((state) => state.toggleLogin);
  const router = useRouter();
  const { pathname } = router;
  //check auth
  //if auth already, redirect to profile page
  //else if check cookie token
  //else redirect to signin page
  React.useEffect(() => {
    console.log(`signin state: ${signin}`);
    console.log(`current path: ${pathname}`);
    //check auth
    if (signin) {
      if (pathname.startsWith("/v0/auth")) router.push("/v0/profile");
    } else {
      if (pathname.startsWith("/v0/auth/success/signin")) {
        window
          .fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/v0/auth/oauth`, {
            method: "GET",
          })
          .then(async (response) => {
            if (response.status === 200) {
              const data = await response.json();
              console.log(data);
              window.localStorage.setItem("token", data.token);
              //router.push(data.originalUrl);
              toggleLogin(true);
            } else {
              console.error(await response.json());
            }
          })
          .catch((err) => {
            //router.push(custom error page);
          });
      }
      if (!pathname.startsWith("/v0/auth")) router.push("/v0/auth/signin");
    }
  }, []);
  return <div>{props.children}</div>;
}

export default Authentication;

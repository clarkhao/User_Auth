//应用模块
import React, { Fragment } from "react";
import { SigninSchema } from "../../utils/validate";
import { hybridEncrypt } from "../../utils";
//style
import style from "./SigninLeft.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Input from "../../ui/InputUI";
import Mark from "../../ui/MarkUI";
import Button from "@mui/material/Button";
import { iconLibrary } from "../../utils";
import Link from "next/link";
import { useRouter } from "next/router";
//type
import { SideSign } from "../../utils";

type TSigninLeft = {
  /**
   * i18n data
   */
  i18n?: SideSign;
};

function SigninLeft({ i18n, ...props }: TSigninLeft) {
  const router = useRouter();
  const { locale } = router;
  const theme = useTheme();
  const [data, setData] = React.useState({
    name: "",
    password: "",
  });
  const [errMsgs, setErrMsgs] = React.useState({
    name: "",
    password: "",
  });
  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, name: e.target.value });
  };
  const handlePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, password: e.target.value });
  };
  const handleClearErr = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrMsgs({ ...errMsgs, name: "", password: "" });
  };
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    //verify
    const verified = SigninSchema.safeParse(data);
    if (!verified.success) {
      const issues = verified.error.issues;
      console.log(issues);
      const errSet = new Set();
      const errMessages: { [key: string]: string } = {};
      issues
        .filter((e) => {
          if (!errSet.has(e.path[0])) {
            errSet.add(e.path[0]);
            return true;
          } else {
            return false;
          }
        })
        .forEach((e) => {
          switch (e.path[0]) {
            case "name":
              if (e.message === "min")
                errMessages[e.path[0]] =
                  (i18n?.user_min_err as string) ?? "用户名至少5位字符";
              else if (e.message === "max")
                errMessages[e.path[0]] =
                  (i18n?.user_max_err as string) ?? "用户名最多25位字符";
              else if (e.message === "regex")
                errMessages[e.path[0]] =
                  (i18n?.user_regex_err as string) ??
                  "用户名只能有字母数字组成";
              break;
            case "password":
              if (e.message === "min")
                errMessages[e.path[0]] =
                  (i18n?.password_min_err as string) ?? "至少6位字母数字";
              else if (e.message === "max")
                errMessages[e.path[0]] =
                  (i18n?.password_max_err as string) ?? "最多25位字符";
              else if (e.message === "regex")
                errMessages[e.path[0]] =
                  (i18n?.password_regex_err as string) ??
                  "包含至少1位大写小写字母或数字";
              break;
            default:
              break;
          }
        });
      console.log(`errMessages: ${JSON.stringify(errMessages)}`);
      setErrMsgs({ ...errMsgs, ...errMessages });
    } else {
      //encrypt
      const encrypted = await hybridEncrypt(verified.data);
      //post
      fetch(
        `${process.env.NEXT_PUBLIC_ORIGIN}/api/v0/auth/signin?locale=${locale}`,
        {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams({ data: encrypted }),
          cache: "no-cache",
          redirect: "follow",
        }
      ).then(async (response) => {
        const json = await response.json();
        console.log(json);
        const messages = (JSON.parse(JSON.stringify(json)) as { msg: string })[
          "msg"
        ];
        switch (response.status) {
          case 200:
            //存储localStorage something
            router.push("/");
            break;
          case 401:
            setErrMsgs({
              ...errMsgs,
              ...{
                name: messages.includes("name") ? "用户名错误" : "",
                password: messages.includes("password") ? "密码错误" : "",
              },
            });
            break;
          default:
            //跳转到custom error page
            break;
        }
      });
    }
  };
  return (
    <div
      className={style.container}
      css={css`
        --signin-left-bg: ${theme.palette.neutral.main};
        --signin-left-shadow: ${theme.shadows[4]};
      `}
    >
      <header className={style.header}>
        <Mark size={50} />
        <h2>{"欢迎回来！请登录"}</h2>
      </header>
      <main className={style.main}>
        <div className={style.oauth}>
          <Button
            variant="contained"
            startIcon={iconLibrary.get("github")}
            size="large"
            color="info"
          >
            <Link href={`/api/v0/auth/signin?oauth=github&locale=${locale}`}>
              {i18n?.oauth_github ?? "使用GITHUB登陆"}
            </Link>
          </Button>
          <Button
            variant="contained"
            startIcon={iconLibrary.get("google")}
            size="large"
            color="warning"
          >
            <Link href={`/api/v0/auth/signin?oauth=google&locale=${locale}`}>
              {i18n?.oauth_google ?? "使用GOOGLE登陆"}
            </Link>
          </Button>
          <p>{"或者"}</p>
        </div>
        <form id="signup-form" className={style.form}>
          <Input
            type="text"
            name="name"
            labelText={i18n?.user_title ?? "用户名"}
            width="100%"
            value={data.name}
            handleInput={handleUserInput}
            errMsg={errMsgs.name}
            handleFocus={handleClearErr}
          />
          <Input
            type="password"
            name="pwd"
            labelText={i18n?.password_title ?? "密码"}
            width="100%"
            value={data.password}
            handleInput={handlePwdInput}
            errMsg={errMsgs.password}
            handleFocus={handleClearErr}
          />
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            {i18n?.submit ?? "登陆"}
          </Button>
        </form>
      </main>
    </div>
  );
}

export default SigninLeft;

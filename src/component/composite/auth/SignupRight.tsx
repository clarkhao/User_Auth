//应用模块
import React, { Fragment } from "react";
import { verifySignup, signupSchema } from "../../utils/validate";
import { hybridEncrypt } from "../../utils";
//style
import style from "./SignupRight.module.css";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import Input from "../../ui/InputUI";
import Button from "@mui/material/Button";
import { iconLibrary, JsonValue } from "../../utils";
import Link from "next/link";
import { useRouter } from "next/router";
//type
import { SideSignup } from "../../utils";

type TSignupRight = {
  /**
   * i18n data
   */
  i18n?: SideSignup;
};

function SignupRight({ i18n, ...props }: TSignupRight) {
  const router = useRouter();
  const { locale } = router;
  const theme = useTheme();
  const [data, setData] = React.useState({
    email: "",
    name: "",
    password: "",
    rePwd: "",
  });
  const [errMsgs, setErrMsgs] = React.useState({
    email: "",
    name: "",
    password: "",
    rePwd: "",
  });
  //开始处理加密开始loading, loading true时出现loading图标
  const [isLoading, setIsLoading] = React.useState(false);
  //如果成功出现成功提示
  const [isSuccess, setIsSuccess] = React.useState(false);
  React.useEffect(() => {
    setErrMsgs({ ...errMsgs, email: "", name: "", password: "", rePwd: "" });
  }, [locale]);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, email: e.target.value });
  };
  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, name: e.target.value });
  };
  const handlePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, password: e.target.value });
  };
  const handleRePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, rePwd: e.target.value });
  };
  const handleClearErr = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrMsgs({ ...errMsgs, email: "", name: "", password: "", rePwd: "" });
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      //verify data
      const verified = signupSchema.safeParse(data);
      if (!verified.success) {
        const issues = verified.error.issues;
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
              case "email":
                errMessages[e.path[0]] = i18n?.email_err as string;
                break;
              case "name":
                if (e.message === "min")
                  errMessages[e.path[0]] = i18n?.user_min_err as string;
                else if (e.message === "max")
                  errMessages[e.path[0]] = i18n?.user_max_err as string;
                else if (e.message === "regex")
                  errMessages[e.path[0]] = i18n?.user_regex_err as string;
                break;
              case "password":
                if (e.message === "min")
                  errMessages[e.path[0]] = i18n?.password_min_err as string;
                else if (e.message === "max")
                  errMessages[e.path[0]] = i18n?.password_max_err as string;
                else if (e.message === "regex")
                  errMessages[e.path[0]] = i18n?.password_regex_err as string;
                break;
              case "rePwd":
                errMessages[e.path[0]] = i18n?.rePwd_err as string;
                break;
              default:
                break;
            }
          });
        console.log(`errMessages: ${JSON.stringify(errMessages)}`);
        setErrMsgs({ ...errMsgs, ...errMessages });
      } else {
        setIsLoading(true);
        //encrypt data
        const encrypted = await hybridEncrypt(verified.data);
        //post data
        fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/v0/auth/signup?locale=${locale}`, {
          method: "POST",
          mode: 'no-cors',
          body: new URLSearchParams({ data: encrypted }),
          cache: "no-cache",
          redirect: "follow",
        }).then(async (response) => {
          setIsLoading(false);
          const json = await response.json();
          console.log(json);
          const messages = (
            JSON.parse(JSON.stringify(json)) as { msg: string }
          )["msg"];
          switch (response.status) {
            case 201:
              router.push("/v0/auth/success/signup");
              break;
            case 409:
              setErrMsgs({
                ...errMsgs,
                ...{
                  name: messages.includes("name")
                    ? (i18n?.http_409_name as string)
                    : "",
                  email: messages.includes("email")
                    ? (i18n?.http_409_email as string)
                    : "",
                },
              });
              break;
            default:
              break;
          }
        });
      }
    } catch (error) {
      //可能的错误，加密失败，网络失败
      console.log(`${error}`);
    }
  };

  return (
    <div
      className={style.container}
      css={css`
        --signup-right-bg: ${theme.palette.neutral.main};
        --signup-right-font-color: ${theme.palette.text.primary};
        --signup-right-shadow: ${theme.shadows[4]};
        --signup-right-link-color: ${theme.palette.primary.main};
        --signup-right-oauth-font-color: ${theme.palette.background.default}
      `}
    >
      <header>
        <div className={style.title}>{i18n?.title}</div>
        <Link href="/auth/signin">{i18n?.signinHint}</Link>
      </header>
      <form id="signup-form" className={style.form}>
        <Input
          type="email"
          name="email"
          labelText={i18n?.email_title}
          width="100%"
          value={data.email}
          handleInput={handleEmailInput}
          errMsg={errMsgs.email}
          handleFocus={handleClearErr}
        />
        <Input
          type="text"
          name="name"
          labelText={i18n?.user_title}
          width="100%"
          value={data.name}
          handleInput={handleUserInput}
          errMsg={errMsgs.name}
          handleFocus={handleClearErr}
        />
        <Input
          type="password"
          name="pwd"
          labelText={i18n?.password_title}
          width="100%"
          value={data.password}
          handleInput={handlePwdInput}
          errMsg={errMsgs.password}
          handleFocus={handleClearErr}
        />
        <Input
          type="password"
          name="rpwd"
          labelText={i18n?.rePwd_title}
          width="100%"
          value={data.rePwd}
          handleInput={handleRePwdInput}
          errMsg={errMsgs.rePwd}
          handleFocus={handleClearErr}
        />
        <Link href="/auth/privacy">{i18n?.privacy}</Link>
        <Button variant="contained" fullWidth onClick={handleSubmit}>
          {i18n?.submit}
        </Button>
      </form>
      <footer>
        <div>{i18n?.oauth_hint}</div>
        <div className={style.oauth}>
          <Button
            variant="contained"
            startIcon={iconLibrary.get("github")}
            color="info"
          >
            <Link href={`/api/v0/auth/signin?oauth=github&locale=${locale}`}>
              {i18n?.oauth_github}
            </Link>
          </Button>
          <Button
            variant="contained"
            startIcon={iconLibrary.get("google")}
            color="warning"
          >
            <Link href={`/api/v0/auth/signin?oauth=google&locale=${locale}`}>
              {i18n?.oauth_google}
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default SignupRight;

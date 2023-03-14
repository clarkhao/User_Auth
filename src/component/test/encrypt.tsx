//应用模块
import React, { Fragment, Suspense } from "react";
import { hybridEncrypt } from "../utils";
//style
import style from "./encrypt.module.css";
//组件
import Input from "../ui/InputUI";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
const Content = React.lazy(() => import("../layout/Content"));

type TEncrypt = {};

function Encrypt({ ...props }: TEncrypt) {
  const [name, setName] = React.useState("");
  const [password, setPwd] = React.useState("");
  const [content, setContent] = React.useState<string>();
  const handleEncrypt = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const encrypted = new Promise((resolve, reject) => {
      window.setTimeout(() => {
        resolve(hybridEncrypt({ name, password }))
      }, 1000)
    })
    setContent(await (encrypted as Promise<string | undefined>));
  };
  return (
    <>
      <Input
        type="text"
        name="name"
        handleFocus={() => {}}
        value={name}
        handleInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          setName(e.target.value);
        }}
      />
      <Input
        type="password"
        name="password"
        handleFocus={() => {}}
        value={password}
        handleInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          setPwd(e.target.value);
        }}
      />
      <Button
        variant="contained"
        size="large"
        onClick={handleEncrypt}
        color="primary"
      >
        Encrypt
      </Button>
      <Suspense fallback={<p>...loading</p>}>
        <Content content={content} />
      </Suspense>
    </>
  );
}

export default Encrypt;

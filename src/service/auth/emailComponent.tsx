import React, { lazy, Suspense } from "react";
import SignupEmailCN from "../../../public/locales/cn/signupEmail.mdx";
import SignupEmailEN from "../../../public/locales/en/signupEmail.mdx";
import SignupEmailJP from "../../../public/locales/jp/signupEmail.mdx";

type TEmailTemplate = {
  /**
   * url with token
   */
  url: string;
  /**
   * locale
   */
  locale: string;
};

function EmailTemplate({ url, locale }: TEmailTemplate) {
  return (
    <>
      {locale === "cn" ? (
        <SignupEmailCN
          components={{ UrlComponent: () => <a href={url}>{url}</a> }}
        />
      ) : locale === "en" ? (
        <SignupEmailEN
          components={{ UrlComponent: () => <a href={url}>{url}</a> }}
        />
      ) : (
        <SignupEmailJP
          components={{ UrlComponent: () => <a href={url}>{url}</a> }}
        />
      )}
    </>
  );
}

export default EmailTemplate;

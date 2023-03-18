import React, {lazy} from "react";

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

function EmailTemplate({ url,locale, ...props }: TEmailTemplate) {
  const SignupEmail = lazy(() => import(`../../../public/locales/${locale}/signupEmail.mdx`));
  return (
    <>
      <div>
        <SignupEmail components={{UrlComponent: () => <a href={url}>{url}</a>}}/>
      </div>
    </>
  );
}

export default EmailTemplate;

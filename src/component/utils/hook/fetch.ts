import React from "react";

function useFetch(data: unknown) {
  //激发fetch
  const [toFetch, setToFetch] = React.useState(false);
  //开始处理加密开始loading, loading true时出现loading图标
  const [isLoading, setIsLoading] = React.useState(false);
  //如果发生错误，留在本页，如果成功出现成功提示
  const [isErr, setIsErr] = React.useState(true);

  React.useEffect(() => {

  }, [])

  return {setToFetch, isLoading, isErr};
}

export {useFetch};
import "swagger-ui-react/swagger-ui.css";
import dynamic from "next/dynamic";

const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });
function APIDoc() {
  let jsonUrl = "/docs.json";
  
  return (
    <>
      <SwaggerUI url={jsonUrl} />
    </>
  );
}

export default APIDoc;

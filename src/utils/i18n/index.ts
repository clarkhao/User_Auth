import { GetStaticPropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import path from "path";
import fs from "fs";
//used inside getStaticProps
//locale files put inside the public dir
const readI18nFiles = async (
  context: GetStaticPropsContext<ParsedUrlQuery, PreviewData>,
  fileName: string
) => {
  try {
    const i18nDir = path.join(process.cwd(), "/public/locales");
    const filePath = path.join(i18nDir, `/${context.locale}/${fileName}.json`);
    console.log(filePath);

    let data = "";
    const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
    return await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => {
        data += chunk;
      });
      stream.on("end", () => {
        resolve(JSON.parse(data));
      });
      stream.on("error", (err) => {
        throw new Error(err.stack);
      });
    });
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export { readI18nFiles };

import { Html, Head, Main, NextScript } from 'next/document'
/**
 * 在body中添加global css className可以控制主题
 */
export default function Document() {
  return (
    <Html>
      <Head />
      <body className='layout-light'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
import React from 'react';
/* storybook 中 test */
function Content({ content }: { content: string | undefined }) {
  return (
    <>
      <div>{content}</div>
    </>
  );
}

export default Content;
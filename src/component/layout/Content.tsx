import React from 'react';

function Content({ content }: { content: string | undefined }) {
  return (
    <>
      <div>{content}</div>
    </>
  );
}

export default Content;
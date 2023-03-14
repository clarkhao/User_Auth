//应用
import React, { ReactElement } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
//style
import style from './MarkUI.module.css';
import { css } from '@emotion/react';
//组件
import IconButton from '@mui/material/IconButton';
//hooks
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';

type MarkType = {
  /**
   * size control both the svg and text
   */
  size: number;
  /**
   * lottie file uri
   */
  src?: string;
}

function Mark({ size, ...props }: MarkType) {
  const router = useRouter();
  return (
    <div className={style.container} css={css`--mark-size: ${size}px;`}>
      <IconButton onClick={() => {router.push('/')}} color='default'>
        <Player
          autoplay
          loop
          src={props.src ?? "https://assets8.lottiefiles.com/packages/lf20_cy11of6d.json"}
          className='player'
          style={{ height: `${size}px`, width: `${size}px` }}
        />
      </IconButton>
      <div className={style.title}>Doggy Catty</div>
    </div>
  )
}

export default Mark;
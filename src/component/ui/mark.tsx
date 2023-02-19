//应用
import React from 'react';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
//style
import style from './mark.module.css';
import {css} from '@emotion/react';
//组件
import IconButton from '@mui/material/IconButton';

type MarkType = {
    /**
     * size control both the svg and text
     */
    size: number;
    /**
     * click handler
     */
    handleClick: React.MouseEventHandler;
}

function Mark({size, ...props}: MarkType) {
    return (
        <div className={style.container} css={css`--mark-size: ${size}px;`}>
            <IconButton onClick={props.handleClick}> 
                <Player 
                  autoplay
                  loop
                  src="https://assets1.lottiefiles.com/packages/lf20_myejiggj.json"
                  className='player' 
                  style={{ height: `${size}px`, width: `${size}px`}}
                />
            </IconButton>
            <p>Doggy Catty</p>
        </div>
    )
}

export default Mark;
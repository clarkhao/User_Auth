//应用
import React from 'react';
//style
import style from './switch.module.css';
import {css} from '@emotion/react';

type SwitchType = {
    /**
     * html element id
     */
    id: string;
}

function Switch({id,...props}: SwitchType) {
    return (
        <>
            <input className={style.input} type='checkbox' id={id}/>
            <label className={style.label} css={css`--sun-svg: url('http://localhost:3000/sun-fill.svg');`} htmlFor={id}></label>
        </>
    )
}

export default Switch;
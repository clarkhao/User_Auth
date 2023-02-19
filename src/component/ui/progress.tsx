/**
 * 
 */
//应用
import React from 'react';
//style
import style from './progress.module.css';
//组件
import LinearProgress from '@mui/material/LinearProgress';

export type ProgressType = {
    /**
     * value from 0 to 100 when status is determinate
     */
    value: number;
    /**
     * text show progress
     */
    text: string;
}
function Progress({value, ...props}: ProgressType) {
    return (
        <div className={style.container}>
            <h2>{value > 0 ? `${value}%` : props.text}</h2>
            {value > 0 ? <LinearProgress color='primary' value={value} variant='determinate' /> : 
                            <LinearProgress color='primary' />}
            
        </div>
    )
}

export default Progress;
//应用
import React, {ChangeEvent, useRef} from 'react';
//style
import style from './input.module.css';
import {css} from '@emotion/react';
import { useTheme } from '@mui/material/styles';
//组件
import {iconLibrary} from '../utils/define';

type InputType = {
    /**
     * id used for input element
     */
    id: string;
    /**
     * type indicated icon and input type
     */
    type: string;
    /**
     * width indicate input width
     */
    width?: number;
    /**
     * optional text used in label
     */
    text?: string;
    /**
     * input value
     */
    value?: string;
    /**
     * input name
     */
    name: string;
    /**
     * handleChange used for state bind
     */
    handleChange?: (e:React.ChangeEvent<HTMLInputElement>) => void;
    /**
     * errMsg indicate error returned from data validate and request result
     */
    errMsg?: string;
    /**
     * handleFocus用于在父级中清除errMsg，重新渲染后Input错误消失
     */
    handleFocus: React.FocusEventHandler;
    /**
     * handle enter click event
     */
    handleEnterClick?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    /**
     * custom search autocomplete
     */
}

function Input({id, type, width= 200, value, ...props}: InputType) {
    const theme = useTheme();
    const isErr = props.errMsg && props.errMsg.length > 0;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleControlFocus: React.MouseEventHandler = (e) => {
        e.preventDefault();
        inputRef.current && inputRef.current.focus();
    }
    const [inputValue, setInputValue] = React.useState('');
    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setInputValue(e.target.value);
    }
    return (
        <div className={[style.container, isErr ? style.error : ''].join(' ')}
            css={css`--input-width: ${width}px;
                --input-error-color: ${theme.palette.error.dark};`}>
            <input className={[style.input, isErr ? style.error : ''].join(' ')}
                ref={inputRef} id={id} type={type} name={props.name} 
                value={value ?? inputValue} 
                placeholder={props.text ?? type}
                onChange={props.handleChange ?? handleInputChange} 
                onFocus={props.handleFocus}
                onKeyDown={props.handleEnterClick}/>
            <span onClick={handleControlFocus}>{iconLibrary.get(type)}</span>
            {type === 'search' ? null : 
            <label className={style.label} htmlFor={id}>{type}</label>}
            <div className={[style.bottom, type === 'search' ? style.search : ''].join(' ')}>{isErr ? props.errMsg : ''}</div>
        </div>
    )
}

export default Input;
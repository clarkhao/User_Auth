//应用
import React, { useRef, useId } from "react";
//style
import style from "./InputUI.module.css";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
//组件
import { iconLibrary } from "../utils";
//hooks
import { useInput } from "../utils";

type InputType = {
  /**
   * type indicated icon and input type,
   * 'email'|'password'|'text'|'search'
   */
  type: string;
  /**
   * width indicate input width
   */
  width?: string;
  /**
   * optional text used in label
   */
  labelText?: string;
  /**
   * value
   */
  value?: string;
  /**
   * input name prop
   */
  name: string;
  /**
   * handleChange used for state bind
   */
  handleInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
};

function Input({ type, width = "200px", value, ...props }: InputType) {
  const theme = useTheme();
  const inputId = useId();
  const { inputState, inputDispatch } = useInput(props.errMsg);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleControlFocus: React.MouseEventHandler = (e) => {
    e.preventDefault();
    inputRef.current && inputRef.current.focus();
  };
  /**
   * oninput事件更新input中的value
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputDispatch({ type: "set-inputvalue", payload: e.target.value });
  };
  /**
   * onblur失去焦点事件时，判断input中value length是否length>0
   */
  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputDispatch({ type: "is-inputfilled", payload: null });
  };
  /**
   * onfocus事件时，取消error显示
   */
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputDispatch({ type: "is-err", payload: false });
  };
  /**
   * password input类型时，眼睛图标转换和密码是否显示转换
   */
  const handleTypeChange = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    inputDispatch({ type: "pwd-toggle", payload: null });
  };
  return (
    <div
      className={[style.container, inputState.isErr ? style.error : ""].join(
        " "
      )}
      css={css`
        --input-width: ${width};
        --input-error-color: ${theme.palette.error.main};
        --input-border-color: ${theme.palette.text.primary};
        --input-bg-color: ${theme.palette.background.default};
        --input-text-color: ${theme.palette.text.primary};
      `}
    >
      <input
        className={[
          style.input,
          inputState.isErr ? style.error : "",
          type === "password" ? style.eye : "",
        ].join(" ")}
        ref={inputRef}
        id={inputId}
        type={type === "password" ? inputState.pwdToggle.type : type}
        name={props.name}
        value={value ?? inputState.inputValue}
        onInput={props.handleInput ?? handleInputChange}
        onBlur={handleInputBlur}
        onFocus={props.handleFocus ?? handleFocus}
        onKeyDown={props.handleEnterClick}
      />
      <span className={style.licon} onClick={handleControlFocus}>
        {iconLibrary.get(type)}
      </span>
      <span
        className={[
          style.ricon,
          value || inputState.inputValue ? style.visible : "",
        ].join(" ")}
        onClick={handleTypeChange}
      >
        {type === "password"
          ? iconLibrary.get(inputState.pwdToggle.icon)
          : null}
      </span>
      {type === "search" ? null : (
        <label
          className={[
            style.label,
            (value && value.length > 0) || inputState.isInputFilled
              ? style.fill
              : "",
          ].join(" ")}
          htmlFor={inputId}
        >
          {props.labelText ?? type}
        </label>
      )}
      <div
        className={[style.bottom, type === "search" ? style.search : ""].join(
          " "
        )}
      >
        {inputState.isErr ? props.errMsg : ""}
      </div>
    </div>
  );
}

export default Input;

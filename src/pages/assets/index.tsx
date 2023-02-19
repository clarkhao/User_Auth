/**
 * list all files
 * 包括三个主要组件，menu bar, item list, pagination
 * useContext和useReducer状态管理
 * 搜索采用防抖
 */
//应用
import React from 'react';
//style 
import style from '../../styles/assets.module.css';
//组件
import Bar from '../../component/layout/bar';
import {Left, Right} from '../../component/composite/barElement';

function Assets() {
    return (
        <>
            <Bar left={<Left />} right={<Right />}/>
        </>
    )
}

export default Assets;
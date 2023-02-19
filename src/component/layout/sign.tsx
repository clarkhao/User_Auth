import React from 'react';
import style from './sign.module.css';

export type signType = {
    lChild: React.ReactNode,
    rChild: React.ReactNode,
}

function SignLayout(props: signType) {
    return (
        <main className={style.layout}>
            {props.lChild}
            {props.rChild}
        </main>
    )
}

export default SignLayout;
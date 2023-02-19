//应用
import React from 'react';
//style
import style from './card.module.css';
import { useTheme } from '@mui/material/styles';
import {css} from '@emotion/react';

export type cardType = {
    childrend: React.ReactNode,
}

function CardLayout(props: cardType) {
    const theme = useTheme();
    return (
        <main className={style.layout}
            css={css`--background-color: ${theme.palette.divider};`}>
            {props.childrend}
        </main>
    )
}

export default CardLayout;
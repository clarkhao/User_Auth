//应用
import React from 'react';
import {FileNameListType} from '../utils/type';
//style
import style from './ListUI.module.css';
import {iconLibrary} from '../utils';
import { useTheme } from '@mui/material/styles';
import {css} from '@emotion/react';
//组件
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Avatar from '@mui/material/Avatar';
import { IconButton } from '@mui/material';

export type ListType = {
    /**
     * list that is used to render
     */
    list: Array<FileNameListType>;
    /**
     * optional left icon
     */
    lIcon?: string;
    /**
     * optional right icon
     */
    rIcon?: string;
    /**
     * remove item handler
     */
    handleRemove?: (id:string) => void;
}

function List({list,...props}: ListType) {
    const theme = useTheme();
    console.log(list);
    return (
        <>
            <ul className={style.container} css={css`background-color: ${theme.palette.primary.main};`}>
                {list.map(
                    el => {
                        return (
                            <li key={el.id} css={css`--hover-filename-color: ${theme.palette.info.light};
                            --hover-trash-color: ${theme.palette.warning.dark}`}>
                                {props.lIcon !== undefined ? <Avatar>
                                        <SvgIcon>{iconLibrary.get(props.lIcon)}</SvgIcon>
                                    </Avatar> : null}
                                <p>{el.name}</p>
                                {props.rIcon !== undefined ? 
                                        <IconButton onClick={() => {
                                            console.log(el.id);
                                            if(props.handleRemove)
                                                props.handleRemove(el.id);
                                        }} sx={{borderRadius: '50%'}} color='primary'>{iconLibrary.get(props.rIcon)}</IconButton>
                                    : null}
                            </li>
                        )
                    }
                )}
            </ul>
        </>
    )
}

export default List;
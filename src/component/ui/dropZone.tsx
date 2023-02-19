//应用
import React from 'react';
import {FileNameListType,FileErrMsgType} from '../utils/type';
import {iconLibrary} from '../utils/define';
//style
import style from './dropZone.module.css';
import {css} from '@emotion/react';
import { useTheme } from '@mui/material/styles';
//组件
import List from './list';

export type DropZoneType = {
    /**
     * 
     */
    handleAddFiles: (data: FileList | File[]) => void;
    /**
     * formData passed by page
     */
    list: FileNameListType[];
    /**
     * height of the container
     */
    height?: string;
    /**
     * remove item handler
     */
    handleRemove?: (id:string) => void;
    /**
     * 
     */
    child?: JSX.Element;
}

function DropZone({handleAddFiles, child, ...props}: DropZoneType) {
    const theme = useTheme();
    const [dragActive, setDragActive] = React.useState(false);
    const handleDrag: React.DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }
    const handleDragOver: React.DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }
    const handleDragLeave: React.DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }
    const handleDrop: React.DragEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        console.log(e.dataTransfer.files);
        handleAddFiles(e.dataTransfer.files);
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if(e.target.files)
            handleAddFiles(e.target.files);
    }
    return (
        <div
            className={[style.container, (dragActive?style.highlight:'')].join(' ')}
            css={css`height: ${props.height};
                    --hover-upload-color: ${theme.palette.secondary.dark};
                    --upload-color: ${theme.palette.secondary.light};`}
            onDragEnter={handleDrag}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input type='file' id="drop-files" multiple className={style.upload} onChange={handleChange}/>
            <label htmlFor="drop-files" className={style.droparea}>
                {child}
            </label>
            <div className={style.list}>
                {props.list?.length > 0 ? 
                <List list={props.list} lIcon='file' rIcon='trash' handleRemove={props.handleRemove}/> : 
                <div className={style.before}>
                    <p>Drag & Drop your files here</p>
                    <p>or Click to select files</p>
                </div>}
            </div>
        </div>
    )
}

export default DropZone;
/**
 * upload files
 * 在DropZone中使用children-IconChoose，减少重新渲染
 * 使用FormData上传单个或者多个文件
 * files需要验证 类型,extension和size，然后上传
 */
//应用模块
import React from 'react';
import {randomString,iconLibrary} from '../utils'
import axios, { AxiosProgressEvent } from "axios";
import { Fragment } from "react";
//style
import style from './upload.module.css';
import { useTheme } from '@mui/material/styles';
import {css} from '@emotion/react';
//组件
import {FileListType,FileNameListType,FileErrMsgType} from '../utils/type';
import Button from '@mui/material/Button';
import DropZone from "../ui/dropZone";
import {modifyAndValidate} from '../utils/validate/file';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import SvgIcon from '@mui/material/SvgIcon';
import Progress from '../ui/progress';
//hook
import {uploadReducer, initialUploadState} from '../utils/hook/upload';

function Upload() {
    /**
     * fileList used to generate FormData, 状态需要清理，在网络请求成功后可以清理
     * fileNameList used to render the List component，状态需要清理，网络请求成功后清理
     * error产生于zod验证和网络请求错误，在react-toastify中展示，最后一个toast展示后给出一个toastId，此时清理
     * start点击网络请求后变化，表示开始上传，在网络请求后清理，失败或者成功
     * process表示上传百分比，网络请求后清理
     * toastId表示最后一个toast,此时清理error
     */
    const theme = useTheme();
    const [state, dispatch] = React.useReducer(uploadReducer, initialUploadState)
    const addFiles = (data: FileList | File[]) => {
        const files = [] as FileListType[];
        const names = [] as FileNameListType[];
        for(let i = 0; i < data.length; i++) {
            const file = data[i];
            const validated = modifyAndValidate(file);
            if(validated.success) {
                const id = randomString(6);
                files.push({id, file});
                names.push({id, name: file.name});
            } else {
                let msg: string[] = []
                for(const e of validated.error.issues) {
                    if(e.code === 'invalid_enum_value') {
                        if(msg.indexOf('不支持的上传格式') < 0)
                            msg.push('不支持的上传格式');
                    } else {
                        msg.push(e.message);
                    }
                }
                dispatch({type: 'change-error', payload: {name: file.name, msg}});
            }
        }
        dispatch({type: 'add-file', payload: {files, names}});
    }
    React.useEffect(() => {
        if(state.error.msg.length > 0) {
            toast.error(state.error.name);
            state.error.msg.forEach((e,i,a) => {
                if(a.length -1 === i) {
                    const id = toast.error(e);
                    console.log(`toastId: ${id}`);
                    dispatch({type: 'toast-id', payload: id});
                } else {
                    toast.error(e);
                }
            })
        }
    },[state.error])
    React.useEffect(() => {
        dispatch({type: 'change-error', payload: {name: '', msg: []}});
    },[state.toastId])
    const removeFiles = (id: string) => {
        dispatch({type: 'delete-file', payload: id});
    }
    const handleSubmit: React.MouseEventHandler = (e) => {
        e.preventDefault();
        dispatch({type: 'start-upload', payload: true});
        const formData = new FormData();
        state.fileList.forEach(f => {
            formData.append('filename', f.file);
        })
        axios({
            url: process.env.NEXT_PUBLIC_DETA_FILE_API as string,
            method: 'POST',
            data: formData, 
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (e:AxiosProgressEvent) => {
                dispatch({type: 'uploading', payload: Math.round((e.progress as number) * 100)});
            }
        })
        .then(res => {
            console.log(res.data);
            console.log(res.status);
            if(res.status === 200) {
                dispatch({type: 'reset-file', payload: {files: [], names: []}});
            }
        }).catch(err => {
            console.error(err);
            if(err instanceof Error){
                dispatch({type: 'change-error', payload: {name: err.name, msg: [err.message]}});
            }
        }).finally(() => {
            dispatch({type: 'start-upload', payload: false});
            dispatch({type: 'uploading', payload: 0});
            dispatch({type: 'toast-id', payload: 0});
        })
    }
    return (
        <Fragment>
            {state.start ? <div className={style.progress}><Progress value={state.progress} text='uploading...' /></div> : 
            <form className={style.container} 
                css={css`--upload-background-color: ${theme.palette.background.default};`}>
                <div className={style.title}>
                    <h1>Upload Your Files</h1>
                </div>
                <div className={style.drag}>
                    <DropZone list={state.fileNameList}
                        handleAddFiles={addFiles}
                        handleRemove={removeFiles}
                        child={<SvgIcon>{iconLibrary.get('import')}</SvgIcon>}/>
                </div>
                <div className={style.confirm}>
                    <Button onClick={handleSubmit} color='primary' variant='contained' disabled={state.fileNameList.length === 0}>
                        Upload files
                    </Button>
                </div>
            </form>}
            <ToastContainer />
        </Fragment>
    )
}

export default Upload;
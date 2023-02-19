/**
 * 定义upload中useReducer()的准备工作
 */
import {FileListType,FileNameListType,FileErrMsgType} from '../type';
type UploadState = {
    fileList: Array<FileListType>;
    fileNameList: Array<FileNameListType>;
    error: FileErrMsgType;
    start: boolean;
    progress: number;
    toastId: number;
}
type UploadPayload = {
    'add-file': {files: UploadState['fileList'], names: UploadState['fileNameList']};
    'delete-file': string;
    'reset-file': {files: UploadState['fileList'], names: UploadState['fileNameList']};
    'change-error': UploadState['error'];
    'start-upload': UploadState['start'];
    'uploading': UploadState['progress'];
    'toast-id': number;
}
interface IUploadAction {
    type: keyof UploadPayload;
    payload: UploadPayload[IUploadAction['type']];
}
export const uploadReducer = (state: UploadState, action: IUploadAction) => {
    switch (action.type) {
        case 'add-file':
            return {...state, 
                fileList: [...state.fileList, ...(action.payload as UploadPayload['add-file']).files],
                fileNameList: [...state.fileNameList, ...(action.payload as UploadPayload['add-file']).names]
            };
            break;
        case 'delete-file':
            return {...state, 
                fileList: state.fileList.filter(el => el.id !== action.payload as UploadPayload['delete-file']),
                fileNameList: state.fileNameList.filter(el => el.id !== action.payload as UploadPayload['delete-file'])
            };
            break;
        case 'reset-file': 
            return {...state, 
                fileList: (action.payload as UploadPayload['add-file']).files,
                fileNameList: (action.payload as UploadPayload['add-file']).names
            };
            break;
        case 'change-error':
            return {...state, error: action.payload as UploadPayload['change-error']};
            break;  
        case 'start-upload':
            return {...state, start: action.payload as UploadPayload['start-upload']};
            break;
        case 'uploading':
            return {...state, progress: action.payload as UploadPayload['uploading']};
            break;
        case 'toast-id':
            return {...state, toastId: action.payload as UploadPayload['toast-id']};
            break;
        default:
            return state;
            break;
    }
}
export const initialUploadState: UploadState = {
    fileList: [],
    fileNameList: [], 
    error: {name:'',msg:[]},
    start: false,
    progress: 0,
    toastId: 0
} 
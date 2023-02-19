
export type InputType = 'email' | 'password' | 'text';
/**
 * upload types
 */
export type FileListType = {
    id: string;
    file: File;
}
export type FileNameListType = {
    id: string;
    name: string;
}
export type FileErrMsgType = {
    name: string;
    msg: string[];
}
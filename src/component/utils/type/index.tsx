
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
//i18n data for signup page
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null
export type JsonObject = { [Key in string]?: JsonValue }
export interface JsonArray extends Array<JsonValue> { }

export type SideSignup = {
    [key: string]: string;
}
export type Signup = {
    "left": SideSignup;
    "right": SideSignup;
}
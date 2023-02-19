import {FiMail, FiLock, FiUser, FiFile, FiTrash2, FiSearch} from 'react-icons/fi';
import {MdMoveToInbox} from "react-icons/md";
import {Fragment} from 'react';

export const iconLibrary: Map<string, JSX.Element> = new Map([
    ['email', <Fragment key='email-icon'><FiMail /></Fragment>],
    ['password', <Fragment key='pwd-icon'><FiLock /></Fragment>],
    ['text', <Fragment key='text-icon'><FiUser /></Fragment>],
    ['search', <Fragment key='search-icon'><FiSearch /></Fragment>],
    ['file', <Fragment key='search-icon'><FiFile /></Fragment>],
    ['trash', <Fragment key='trash-icon'><FiTrash2 /></Fragment>],
    ['import', <Fragment key='import-icon'><MdMoveToInbox /></Fragment>]
]);
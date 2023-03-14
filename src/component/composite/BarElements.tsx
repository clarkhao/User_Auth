//应用
import React from 'react';
//style
import style from './BarElements.module.css';
//组件
import Mark from '../ui/MarkUI';
import Input from '../ui/InputUI';
import Button from '@mui/material/Button';

export function Left() {
    const [searchText, setSearchText] = React.useState('');
    const handleClick: React.MouseEventHandler = (e) => {

    }
    const handleFocus: React.FocusEventHandler = (e) => {

    }
    const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {        
        if(e.key == 'Enter') {
            console.log('here')
            e.preventDefault();
            setSearchText((e.target as HTMLInputElement).value);
        }
        
    }
    React.useEffect( () => {
        console.log(searchText);
    }, [searchText])
    return (
        <div className={style.container}>
            <Mark size={40} />
            <form method='post'>
                <Input type='search' name='bar-search'
                    handleFocus={handleFocus}
                    handleEnterClick={handleEnterClick}/>
            </form>
        </div>
    )
}
export function Right() {
    return (
        <Button>Add a Photo</Button>
    )
} 
import { useState } from 'react';
import socket from '../socket';

export default function JoinRoom() {
    const [roomIDInput, setRoomIDInput] = useState('');

    function joinRoom() {
        socket.emit('join-room', roomIDInput);
        let inputRoomID = document.querySelector('#inputRoomID');
        inputRoomID.value = '';
    }

    return (
        <div className='p-2 flex gap-2 rounded-md bg-slate-500'>
            <input id='inputRoomID' className='pl-2 rounded-md outline-none' type='text' onChange={(e) => { setRoomIDInput(e.currentTarget.value) }}></input>
            <button onClick={joinRoom}>Join</button>
        </div>
    );
}
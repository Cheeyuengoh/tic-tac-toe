import { useContext, useState } from 'react';
import socket from '../../socket';
import RoomContext from '../../contexts/RoomContext';
import PlayerContext from '../../contexts/PlayerContext';

export default function ChatBar({ setMessages }) {
    const { roomID } = useContext(RoomContext);
    const { playerID } = useContext(PlayerContext);
    const [message, setMessage] = useState('');

    function sendMessage() {
        socket.emit('send-message', { roomID: roomID, message: message });
        setMessages((prevState) => {
            let messages = [...prevState];
            messages.push({ playerID: playerID, text: message });
            return messages;
        });
        let inputChatBar = document.querySelector('#inputCharBar');
        inputChatBar.value = '';
    }

    return (
        <div className='p-2 flex gap-2 rounded-md bg-slate-500'>
            <input id='inputCharBar' className='pl-2 rounded-md outline-none' type='text' onChange={(e) => setMessage(e.currentTarget.value)}></input>
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
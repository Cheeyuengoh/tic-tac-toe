import { useContext, useEffect, useState } from 'react';
import socket from '../../socket';
import ChatBox from './ChatBox';
import ChatBar from './ChatBar';
import RoomContext from '../../contexts/RoomContext';

export default function Chat() {
    const { roomID, setRoomID } = useContext(RoomContext);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        function onSentMessage(result) {
            setMessages((prevState) => {
                let messages = [...prevState];
                messages.push({ playerID: result.playerID, text: result.message });
                return messages;
            });
            console.log(result.log);
        }

        socket.on('sent-message', onSentMessage);

        return () => {
            socket.off('sent-message', onSentMessage);
        }
    }, []);

    function leaveRoom() {
        socket.emit('leave-room', roomID);
        setRoomID(null);
    }

    return (
        <div className='flex flex-col justify-between gap-2'>
            <div className='flex justify-end'>
                <button className='bg-sky-200 p-1 rounded-md' onClick={leaveRoom}>Leave</button>
            </div>
            <div className='flex flex-col gap-2'>
                <ChatBox messages={messages}></ChatBox>
                <ChatBar setMessages={setMessages}></ChatBar>
            </div>
        </div>
    );
}
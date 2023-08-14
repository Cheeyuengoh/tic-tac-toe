import { useContext } from "react";
import socket from "../../socket";
import RoomContext from "../../contexts/RoomContext";
import PlayerContext from "../../contexts/PlayerContext";

export default function Cell({ i, j, playerMark, cell }) {
    const { roomID } = useContext(RoomContext);
    const { playerID } = useContext(PlayerContext);

    function updateGrid() {
        if (cell === 'X' || cell === 'O') {
            console.log('Cell occupied');
            return;
        }
        socket.emit('update-grid', { roomID: roomID, playerID: playerID, playerMark: playerMark, i: i, j: j });
    }

    return (
        <div className='w-[100px] h-[100px] border-2 flex justify-center items-center bg-sky-300 hover:bg-sky-200 cursor-pointer' onClick={updateGrid}>
            <span>{cell}</span>
        </div>
    );
}
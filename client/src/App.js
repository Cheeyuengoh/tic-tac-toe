import './App.css';
import socket from './socket';
import { useEffect, useState } from 'react';
import PlayerContext from './contexts/PlayerContext';
import RoomContext from './contexts/RoomContext';
import JoinRoom from './components/JoinRoom';
import Game from './components/tictactoe/Game';
import Chat from './components/chat/Chat';

function App() {
  const [roomID, setRoomID] = useState(null);
  const [playerID, setPlayerID] = useState(null);
  const [playerCount, setPlayerCount] = useState(null);

  useEffect(() => {
    if (!playerID) {
      socket.emit('player-connect');
    }

    function onPlayerConnected(result) {
      setPlayerID(result.playerID);
      console.log(result.log);
    }

    function onJoinedRoom(result) {
      if (result.joined) {
        setRoomID(result.roomID);
        setPlayerCount(result.playerCount);
      }
      console.log(result.log);
    }

    function onLeftRoom(result){
      setPlayerCount(result.playerCount);
      console.log(result.log);
    }

    socket.on('player-connected', onPlayerConnected);
    socket.on('joined-room', onJoinedRoom);
    socket.on('left-room', onLeftRoom);

    return () => {
      socket.off('player-connected', onPlayerConnected);
      socket.off('joined-room', onJoinedRoom);
      socket.off('left-room', onLeftRoom);
    }
  }, [playerID]);

  return (
    <PlayerContext.Provider value={{ playerID: playerID, setPlayerID: setPlayerID }}>
      <RoomContext.Provider value={{ roomID: roomID, setRoomID: setRoomID }}>
        <div className='w-screen h-screen flex justify-center items-center'>
          {
            roomID ?
              <div className='flex gap-2'>
                {
                  playerCount === 2 ? <Game></Game> : <div>Waiting for another player</div>
                }
                <Chat></Chat>
              </div>
              :
              <JoinRoom></JoinRoom>
          }
        </div>
      </RoomContext.Provider>
    </PlayerContext.Provider>
  );
}

export default App;

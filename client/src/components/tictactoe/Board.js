import { useContext, useEffect, useMemo, useState } from "react";
import socket from "../../socket";
import Cell from './Cell';
import PlayerContext from "../../contexts/PlayerContext";
import RoomContext from "../../contexts/RoomContext";

export default function Board({ startedGame, playerMark, currentPlayer, setCurrentPlayer, setPlayerMark, setStartedGame }) {
    const {roomID} = useContext(RoomContext);
    const { playerID } = useContext(PlayerContext);
    const boardSize = useMemo(() => { return 3 }, []);
    const [grid, setGrid] = useState(null);

    //initGrid
    useEffect(() => {
        if (!grid) {
            let arr = new Array(boardSize);
            for (let i = 0; i < arr.length; i++) {
                arr[i] = new Array(boardSize);
            }

            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length; j++) {
                    arr[i][j] = null;
                }
            }
            setGrid(arr);
        }
    }, [boardSize, grid, setGrid]);

    useEffect(() => {
        function onUpdatedGrid(result) {
            setGrid((prevState) => {
                let grid = [...prevState];
                grid[result.i][result.j] = result.playerMark;
                return grid;
            });
            setCurrentPlayer(result.nextPlayer);
            console.log(result.log);
        }

        socket.on('updated-grid', onUpdatedGrid);

        return () => {
            socket.off('updated-grid', onUpdatedGrid);
        }
    }, [setCurrentPlayer]);

    useEffect(() => {
        function hasWon(type) {
            let count = 0;
            if (type === 'col' || type === 'row') {
                for (let i = 0; i < grid.length; i++) {
                    count = 0;
                    for (let j = 0; j < grid[i].length; j++) {
                        let col = type === 'col' ? i : j
                        let row = type === 'row' ? i : j
                        if (grid[col][row] === 'X') count += 1;
                        if (grid[col][row] === 'O') count += -1
                    }

                    if (count === 3 || count === -3) {
                        console.log('Won', type);
                        return true;
                    }
                }
            }

            if (type === 'diag' || type === 'anti-diag') {
                count = 0;
                for (let i = 0; i < 3; i++) {
                    let row = type === 'diag' ? i : 2 - 1;
                    if (grid[i][row] === 'X') count += 1;

                    if (grid[i][row] === 'O') count += -1;
                }

                if (count === 3 || count === -3) {
                    console.log('Won', type);
                    return true;
                }
            }

            return false;
        }

        function hasDraw() {
            let count = 0;
            for (let i = 0; i < grid.length; i++) {
                if (grid[i] !== null) {
                    count++;
                }
            }

            if (count === (grid.length * grid.length)) {
                console.log('Draw');
                return true;
            }

            return false;
        }

        if (grid) {
            if (hasWon('col') || hasWon('row') || hasWon('diag') || hasWon('anti-diag')) {
                //any won
                setCurrentPlayer(null);
                setPlayerMark(null);
                setStartedGame(false);
            } else if (hasDraw()) {
                //draw
                setCurrentPlayer(null);
                setPlayerMark(null);
                setStartedGame(false);
            }
        }
    }, [grid, setCurrentPlayer, setPlayerMark, setStartedGame]);

    function startGame() {
        socket.emit('start-game', { roomID: roomID });
    }

    if (!grid) return (<div>Loading Grid</div>);

    return (
        <div>
            {
                startedGame ?
                    <div>
                        <span>{currentPlayer === playerID ? 'Your turn' : 'Other player turn'}</span>
                    </div>
                    :
                    <button onClick={startGame}>Start</button>
            }
            <div className={`flex ${currentPlayer !== playerID ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                {
                    grid.map((col, i) => {
                        return <div key={'col-' + i}>
                            {
                                col.map((cell, j) => {
                                    return <Cell key={'row-' + j} i={i} j={j} playerMark={playerMark} cell={cell}></Cell>
                                })
                            }
                        </div>
                    })
                }
            </div>
        </div>
    );
}
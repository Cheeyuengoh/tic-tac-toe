import { useContext, useEffect, useMemo, useState } from "react";
import socket from "../../socket";
import PlayerContext from "../../contexts/PlayerContext";
import RoomContext from "../../contexts/RoomContext";
import Cell from "./Cell";

export default function Game() {
    const { roomID } = useContext(RoomContext);
    const { playerID } = useContext(PlayerContext);
    const boardSize = useMemo(() => { return 3 }, []);
    const [startedGame, setStartedGame] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [playerMark, setPlayerMark] = useState(null);
    const [grid, setGrid] = useState(null);
    const [winner, setWinner] = useState(null);

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

    //socket events
    useEffect(() => {
        function onStartedGame(result) {
            if (result.startedGame) {
                setGrid(null);
                setWinner(null);
                setStartedGame(true);
                setCurrentPlayer(result.startPlayer);

                if (result.startPlayer === playerID) {
                    setPlayerMark('X');
                } else {
                    setPlayerMark('O');
                }
            }
            console.log(result.log);
        }

        function onUpdatedGrid(result) {
            setGrid((prevState) => {
                let grid = [...prevState];
                grid[result.i][result.j] = result.playerMark;
                return grid;
            });
            setCurrentPlayer(result.nextPlayer);
            console.log(result.log);
        }

        socket.on('started-game', onStartedGame);
        socket.on('updated-grid', onUpdatedGrid);

        return () => {
            socket.off('started-game', onStartedGame);
            socket.off('updated-grid', onUpdatedGrid);
        }
    }, [playerID]);

    useEffect(() => {
        function isEndGame() {
            let results = [];
            results.push(checkCol(grid));
            results.push(checkRow(grid));
            results.push(checkDiag(grid));
            results.push(checkAntiDiag(grid));
            results.push(checkDraw(grid));
            for (let i = 0; i < results.length; i++) {
                if (results[i].endGame) return results[i];
            }
            return { endGame: false, result: null };
        }

        if (grid) {
            let result = isEndGame();
            if (result.endGame) {
                setWinner(result.result);
                setCurrentPlayer(null);
                setPlayerMark(null);
                setStartedGame(false);
            }
        }
    }, [grid, setCurrentPlayer, setPlayerMark, setStartedGame]);

    function startGame() {
        socket.emit('start-game', { roomID: roomID });
        setGrid(null);
    }

    if (!grid) return (<div>Loading Grid</div>);
    return (
        <div className='flex flex-col gap-2'>
            <div className='flex justify-between items-center'>
                {
                    startedGame ? <div><span>{currentPlayer === playerID ? 'Your turn' : 'Other player turn'}</span></div> : <button className='bg-sky-200 p-1 rounded-md' onClick={startGame}>Start</button>
                }
                {
                    winner ? <div><span>{winner === 'Draw' ? winner : winner + ' won'}</span></div> : null
                }
            </div>
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

function checkCol(grid) {
    let count;
    for (let i = 0; i < grid.length; i++) {
        count = 0;
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 'X') count += 1;
            if (grid[i][j] === 'O') count += -1;
        }
        if (count === 3) return { endGame: true, result: 'X' };
        if (count === -3) return { endGame: true, result: 'O' };
    }
    return { endGame: false, result: null };
}

function checkRow(grid) {
    let count;
    for (let i = 0; i < grid.length; i++) {
        count = 0;
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[j][i] === 'X') count += 1;
            if (grid[j][i] === 'O') count += -1;
        }
        if (count === 3) return { endGame: true, result: 'X' };
        if (count === -3) return { endGame: true, result: 'O' };
    }
    return { endGame: false, result: null };
}

function checkDiag(grid) {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        if (grid[i][i] === 'X') count += 1;
        if (grid[i][i] === 'O') count += -1;
    }
    if (count === 3) return { endGame: true, result: 'X' };
    if (count === -3) return { endGame: true, result: 'O' };
    return { endGame: false, result: null };
}

function checkAntiDiag(grid) {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        if (grid[i][2 - i] === 'X') count += 1;
        if (grid[i][2 - i] === 'O') count += -1;
    }
    if (count === 3) return { endGame: true, result: 'X' };
    if (count === -3) return { endGame: true, result: 'O' };
    return { endGame: false, result: null };
}

function checkDraw(grid) {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] !== null) count++;
        }
    }
    if (count === grid.length ** 2) return { endGame: true, result: 'Draw' }
    return { endGame: false, result: null };
}
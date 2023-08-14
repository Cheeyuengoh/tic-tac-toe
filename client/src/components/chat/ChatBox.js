import { useContext } from "react";
import PlayerContext from "../../contexts/PlayerContext";

export default function ChatBox({ messages }) {
    const { playerID } = useContext(PlayerContext);

    return (
        <div className='max-h-[240px] p-2 flex flex-col gap-2 bg-slate-500 rounded-md overflow-y-scroll'>
            {
                messages.map((message, i) => {
                    return <div key={i} className={`${message.playerID === playerID ? 'text-right' : null}`}>
                        <span className='p-1 rounded-md inline-block bg-slate-300'>{message.text}</span>
                    </div>
                })
            }
        </div>
    );
}
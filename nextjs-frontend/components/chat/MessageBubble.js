const color1 = 'bg-green-200'
const color2 = 'bg-blue-200'

export default function MessageBubble({ message, date, hash, amISender }) {
    return (
        <div className="w-full h-full border-2 rounded-md whitespace-normal">
            <textarea disabled className={`w-full h-full ${amISender ? color1 : color2} p-2 whitespace-normal`}>
                {message}
            </textarea>
            <div className={`w-full flex flex-row ${amISender ? color2 : color1}`}>
                <p>{date}</p>
                <p className="ml-auto">{`Transaction Hash: ${hash}`}</p>
            </div>
        </div>
    )
} 
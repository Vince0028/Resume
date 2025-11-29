import React, { useState, useEffect, useRef } from 'react';
import { THEME_COLOR } from '../constants';

interface Message {
    id: string;
    created_at: string;
    username: string;
    content: string;
}

interface LiveChatProps {
    onExit: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ onExit }) => {
    const [username, setUsername] = useState<string>('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [tempUsername, setTempUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Polling for messages
    useEffect(() => {
        if (username) {
            const fetchMessages = async () => {
                try {
                    const res = await fetch('/api/chat');
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                        setIsConnected(true);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    setIsConnected(false);
                }
            };

            // Initial fetch
            fetchMessages();

            // Poll every 3 seconds
            const interval = setInterval(fetchMessages, 3000);

            return () => clearInterval(interval);
        }
    }, [username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [username]);

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError('');

        if (!tempUsername.trim()) {
            setUsernameError('Code name cannot be empty');
            return;
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: tempUsername.trim() }),
            });

            if (res.ok) {
                const { isTaken } = await res.json();
                if (isTaken) {
                    setUsernameError(`Code name "${tempUsername.trim()}" is already in use. Choose another.`);
                    setTempUsername('');
                    return;
                }
                setUsername(tempUsername.trim());
            } else {
                // Fallback if API fails
                setUsername(tempUsername.trim());
            }
        } catch (error) {
            console.error('Error validating username:', error);
            setUsername(tempUsername.trim());
        }
    };

    const handleMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !username) return;

        const content = input.trim();
        setInput('');

        if (content.toLowerCase() === '/exit' || content.toLowerCase() === '/quit') {
            onExit();
            return;
        }

        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, content }),
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!username) {
        return (
            <div className="w-full max-w-2xl mt-4">
                <div className={`${THEME_COLOR} mb-4`}>
                    Initializing Secure Chat Protocol...
                    <br />
                    Connection established.
                    <br />
                    Identity verification required.
                </div>
                {usernameError && (
                    <div className="text-red-400 mb-2 text-sm animate-pulse">
                        ⚠ {usernameError}
                    </div>
                )}
                <form onSubmit={handleUsernameSubmit} className="flex items-center">
                    <span className={`${THEME_COLOR} mr-2`}>Enter Code Name:</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className={`bg-transparent border-none outline-none ${THEME_COLOR} font-mono focus:ring-0 flex-1`}
                        autoFocus
                    />
                </form>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col mt-4">
            <div className={`${THEME_COLOR} border-b border-indigo-500/30 pb-2 mb-2 flex justify-between`}>
                <span>SECURE CHANNEL ESTABLISHED as [{username}]</span>
                <span>{isConnected ? 'ONLINE (SECURE)' : 'CONNECTING...'}</span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[60vh] mb-4 scrollbar-hide">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-1 hover:bg-white/5 px-1 rounded transition-colors">
                        <span className="text-indigo-400 text-xs mr-2">[{formatDate(msg.created_at)}]</span>
                        <span className="text-green-400 font-bold">&lt;{msg.username}&gt;</span>{' '}
                        <span className={`${THEME_COLOR}`}>{msg.content}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleMessageSubmit} className="flex items-center border-t border-indigo-500/30 pt-2">
                <span className={`${THEME_COLOR} mr-2`}>[{username}]:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`bg-transparent border-none outline-none ${THEME_COLOR} font-mono focus:ring-0 flex-1`}
                    autoFocus
                    placeholder="Type a message... (/exit to leave)"
                />
            </form>
        </div>
    );
};

export default LiveChat;

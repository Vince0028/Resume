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
    const [tempPassword, setTempPassword] = useState('');
    const [authPending, setAuthPending] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLInputElement>(null);
    const pendingQueueRef = useRef<string[]>([]);

    
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

            
            fetchMessages();

            
            const interval = setInterval(fetchMessages, 1000);

            return () => clearInterval(interval);
        }
    }, [username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (username) {
            
            messageRef.current?.focus();
        } else {
            
            usernameRef.current?.focus();
        }
    }, [username]);

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError('');

        if (!tempUsername.trim()) {
            setUsernameError('Code name cannot be empty');
            return;
        }

        if (!tempPassword.trim()) {
            setUsernameError('Password cannot be empty');
            return;
        }

        if (tempPassword.length < 6) {
            setUsernameError('Password must be at least 6 characters');
            return;
        }

        
        const chosen = tempUsername.trim();
        setUsername(chosen);
        setTempPassword('');
        setTempUsername('');
        setAuthPending(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: chosen, password: tempPassword }),
            });

            const body = await res.json();
            if (res.ok && body.success) {
                
                const queued = pendingQueueRef.current.splice(0);
                for (const content of queued) {
                    try {
                        await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: chosen, content }),
                        });
                    } catch (err) {
                        console.error('Failed to flush queued message:', err);
                    }
                }
            } else {
                
                setUsername('');
                setUsernameError(body.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Error authenticating:', error);
            setUsername('');
            setUsernameError('Connection error. Please try again.');
        } finally {
            setAuthPending(false);
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

        
        const now = new Date().toISOString();
        const tempMsg: Message = { id: `temp-${Date.now()}`, username, content, created_at: now };
        setMessages((L) => [...L, tempMsg]);

        
        if (authPending) {
            pendingQueueRef.current.push(content);
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
                <form onSubmit={handleUsernameSubmit} className="flex flex-col w-full max-w-2xl space-y-2">
                    <label className="flex flex-col">
                        <span className={`${THEME_COLOR} mr-2`}>Code Name:</span>
                        <input
                            ref={usernameRef}
                            type="text"
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            className={`bg-transparent border-none outline-none ${THEME_COLOR} font-mono focus:ring-0 w-full`}
                            placeholder="choose a code name"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className={`${THEME_COLOR} mr-2`}>Password:</span>
                        <input
                            ref={null}
                            type="password"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className={`bg-transparent border-none outline-none ${THEME_COLOR} font-mono focus:ring-0 w-full`}
                            placeholder="password (min 6)"
                        />
                    </label>

                    <button type="submit" className="sr-only">Submit</button>
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

            <form onSubmit={handleMessageSubmit} className="flex items-center border-t border-indigo-500/30 pt-2 space-x-2">
                <span className={`${THEME_COLOR} mr-2`}>[{username}]:~$</span>
                <input
                    ref={messageRef}
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

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CoachService } from '../services/CoachService';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Official Design System Markdown Styles
const MarkdownStyles = {
    h3: ({ ...props }: any) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
    h4: ({ ...props }: any) => <h4 className="text-md font-bold mt-4 mb-2 text-foreground" {...props} />,
    p: ({ ...props }: any) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
    ul: ({ ...props }: any) => <ul className="list-disc ml-10 pl-6 mb-4 space-y-2" {...props} />,
    li: ({ ...props }: any) => <li className="mb-1 ml-3" {...props} />,
    blockquote: ({ ...props }: any) => <blockquote className="border-l-4 border-primary/30 bg-muted/30 pl-4 py-2 italic my-4 text-muted-foreground rounded-r-md" {...props} />,
    hr: () => <hr className="my-6 border-muted" />,
    table: ({ ...props }: any) => <div className="overflow-x-auto my-4 rounded-md border border-muted"><table className="w-full text-left text-xs" {...props} /></div>,
    thead: ({ ...props }: any) => <thead className="bg-muted/50" {...props} />,
    th: ({ ...props }: any) => <th className="p-2 font-bold border-b border-muted" {...props} />,
    td: ({ ...props }: any) => <td className="p-2 border-b border-muted last:border-0" {...props} />,
};

export default function ChatInterface() {
    const { dealer, user, setDealer } = useAuth();
    const [messages, setMessages] = useState<any[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your Virtual Performance Coach. I can help you review your dealership's performance. Try asking: "Generate a performance review for ${dealer?.name || 'my dealership'}"`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        const lowerText = userMessage.text.toLowerCase();
        let botResponseText = "";

        // Standardized Review Logic
        if (lowerText.includes('review') || lowerText.includes('performance')) {
            const { getDealerByName, getCEMForDealer } = await import('../data/cemData');

            const mentionDealer = getDealerByName(userMessage.text);
            const targetDealer = mentionDealer || dealer;

            if (targetDealer) {
                // UPDATE GLOBAL STATE IF WE FOUND A SPECIFIC DEALER IN TEXT
                if (mentionDealer && mentionDealer.id !== dealer?.id) {
                    setDealer(mentionDealer);
                }

                // Interim status message
                const statusMessage = {
                    id: (Date.now() + 0.5).toString(),
                    sender: 'bot',
                    text: `*Preparing performance review for **${targetDealer.name}**...*`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, statusMessage]);

                const reviewText = await CoachService.generateReview(
                    targetDealer.vitallyUuid,
                    targetDealer.name,
                    user?.name || "CEM"
                );

                botResponseText = reviewText;

                // Append personalized CTA with CEM's Calendly link
                const cem = getCEMForDealer(targetDealer.id);
                if (cem && cem.calendarLink) {
                    botResponseText += `\n\n---\n\nIf you would like to review these KPIs or anything else please schedule a Zoom call with me here: [${cem.calendarLink}](${cem.calendarLink})`;
                }
            } else {
                botResponseText = "I couldn't identify which dealership you're asking about. Please specify a name like 'Keeler Honda' or 'Garber Ford'.";
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            botResponseText = "I am specifically optimized to generate performance reviews and ROI analysis. Please ask me about your dealership's performance.";
        }

        const botMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: botResponseText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary text-white rounded-md">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Virtual Coach</h3>
                        <p className="text-xs text-primary font-medium">Ready to analyze</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Icon/Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-muted text-muted-foreground' : 'bg-primary text-white'}`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-lg text-sm shadow-sm transition-all ${msg.sender === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-card text-card-foreground border'
                                }`}>
                                <div className="markdown-content">
                                    <ReactMarkdown components={MarkdownStyles}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                <div className={`text-[10px] mt-2 opacity-70 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="p-4 bg-muted animate-pulse rounded-lg border">
                                <Loader2 className="animate-spin text-primary" size={18} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about performance..."
                        className="flex-1 p-3 pr-12 bg-input border rounded-md text-sm text-foreground placeholder:text-muted-foreground"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}

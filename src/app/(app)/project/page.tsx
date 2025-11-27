"use client";

import { MilestoneInvoice } from "@/components/features/MilestoneInvoice";
import { Send, Upload, Lock, Unlock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface Message {
    id: string;
    sender: "me" | "client";
    text?: string;
    file?: string;
    timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        sender: "me",
        text: "Here is the sketch for the first concept. Let me know what you think!",
        file: "sketch_v1.png",
        timestamp: new Date(Date.now() - 10000000)
    },
    {
        id: "2",
        sender: "client",
        text: "Looks great! Can we make the sword a bit bigger?",
        timestamp: new Date(Date.now() - 5000000)
    }
];

export default function ProjectHubPage() {
    const [isUploadLocked, setIsUploadLocked] = useState(true);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: "me",
            text: inputValue,
            timestamp: new Date()
        };

        setMessages([...messages, newMessage]);
        setInputValue("");
    };

    const handleUpload = () => {
        alert("Upload dialog would open here.");
    };

    return (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Status & Milestones */}
            <div className="space-y-6">
                {/* Project Status Tracker */}
                <div className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase">Project Progress</h3>
                        <span className="text-primary font-mono">45%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>

                <MilestoneInvoice />
            </div>

            {/* Middle/Right: Chat & Activity */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col h-[600px]">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Activity Feed</h3>

                    {/* Freelancer Upload Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsUploadLocked(!isUploadLocked)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border",
                                isUploadLocked
                                    ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                                    : "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30 hover:bg-[#30D158]/20"
                            )}
                        >
                            {isUploadLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {isUploadLocked ? "Upload Locked" : "Upload Unlocked"}
                        </button>
                        <button
                            onClick={handleUpload}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={clsx("flex gap-3", msg.sender === "client" ? "flex-row-reverse" : "")}>
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                msg.sender === "me" ? "bg-primary text-primary-foreground" : "bg-purple-600 text-white"
                            )}>
                                {msg.sender === "me" ? "FC" : "CL"}
                            </div>
                            <div className={clsx(
                                "p-3 max-w-[80%]",
                                msg.sender === "me"
                                    ? "bg-muted rounded-lg rounded-tl-none"
                                    : "bg-primary/20 border border-primary/30 rounded-lg rounded-tr-none"
                            )}>
                                {msg.text && <p className="text-sm text-foreground">{msg.text}</p>}
                                {msg.file && (
                                    <div className="mt-2 p-2 bg-card rounded border border-border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                            <span className="text-xs text-muted-foreground">{msg.file}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical, User, ChevronRight, Send, Plus, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
}

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface Conversation {
    id: string;
    other_user: Profile | null;
    last_message: Message | null;
}

export function MessagesWidget() {
    const { user } = useUser();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchResults, setSearchResults] = useState<Profile[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id);
            const channel = supabase
                .channel(`conversation:${activeConversation.id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversation.id}` }, (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                    scrollToBottom();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        if (!user) return;
        setLoading(true);

        // 1. Get all conversation IDs the user is part of
        const { data: myConvos, error: myConvosError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (myConvosError || !myConvos) {
            setLoading(false);
            return;
        }

        const conversationIds = myConvos.map(c => c.conversation_id);

        if (conversationIds.length === 0) {
            setConversations([]);
            setLoading(false);
            return;
        }

        // 2. Get the other participants for these conversations
        const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('conversation_id, user_id')
            .in('conversation_id', conversationIds)
            .neq('user_id', user.id);

        if (participantsError || !participants) {
            setLoading(false);
            return;
        }

        // 3. Get profile details for these participants
        const userIds = participants.map(p => p.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        // 4. Get last message for each conversation (simplified: just get latest message overall for now or skip)
        // For MVP, we won't fetch last message preview efficiently without a complex query. 
        // We'll just list the users.

        const loadedConversations: Conversation[] = participants.map(p => {
            const profile = profiles?.find(prof => prof.id === p.user_id) || null;
            return {
                id: p.conversation_id,
                other_user: profile,
                last_message: null // TODO: Implement last message fetch
            };
        });

        setConversations(loadedConversations);
        setLoading(false);
    };

    const fetchMessages = async (conversationId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || !user) return;

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: activeConversation.id,
                sender_id: user.id,
                content: newMessage.trim()
            });

        if (!error) {
            setNewMessage("");
        }
    };

    const handleSearchUsers = async () => {
        if (!searchUsername.trim()) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .ilike('username', `%${searchUsername}%`)
            .limit(5);

        if (data) {
            setSearchResults(data);
        }
    };

    const startConversation = async (otherUserId: string) => {
        if (!user) return;

        // Check if conversation already exists
        // This check is complex client-side. For MVP, just create a new one or rely on backend constraints if we had them.
        // Better: Create conversation, insert participants.

        const { data: convo, error: convoError } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (convo) {
            await supabase.from('conversation_participants').insert([
                { conversation_id: convo.id, user_id: user.id },
                { conversation_id: convo.id, user_id: otherUserId }
            ]);

            // Refresh list and open
            await fetchConversations();
            const otherUser = searchResults.find(r => r.id === otherUserId);
            setActiveConversation({
                id: convo.id,
                other_user: otherUser || null,
                last_message: null
            });
            setIsNewChatOpen(false);
        }
    };

    if (activeConversation) {
        return (
            <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
                    <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                            {activeConversation.other_user?.avatar_url ? (
                                <img src={activeConversation.other_user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">{activeConversation.other_user?.full_name || "Unknown User"}</h3>
                            <p className="text-xs text-muted-foreground">@{activeConversation.other_user?.username}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                                <div className={clsx(
                                    "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                                    isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-card">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-header italic tracking-tight text-foreground">Messages</h1>
                <button
                    onClick={() => setIsNewChatOpen(true)}
                    className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* New Chat Modal / Area */}
            {isNewChatOpen && (
                <div className="mb-6 p-4 bg-card border border-border rounded-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">New Message</h3>
                        <button onClick={() => setIsNewChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            placeholder="Search username..."
                            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                        <button onClick={handleSearchUsers} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl font-bold text-sm">
                            Search
                        </button>
                    </div>
                    <div className="space-y-2">
                        {searchResults.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => startConversation(profile.id)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{profile.full_name}</div>
                                    <div className="text-xs text-muted-foreground">@{profile.username}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversation List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map((convo) => (
                        <div
                            key={convo.id}
                            onClick={() => setActiveConversation(convo)}
                            className="bg-card/95 backdrop-blur-sm border border-border/50 p-4 rounded-3xl flex items-center gap-4 shadow-lg shadow-black/5 hover:scale-[1.02] transition-all cursor-pointer group"
                        >
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-white/20 to-transparent shrink-0">
                                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background">
                                    {convo.other_user?.avatar_url ? (
                                        <img src={convo.other_user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="font-bold text-muted-foreground text-lg">
                                                {convo.other_user?.full_name?.charAt(0) || "?"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl text-foreground tracking-tight mb-1">
                                    {convo.other_user?.full_name || "Unknown User"}
                                </h3>
                                <p className="text-muted-foreground text-sm font-medium truncate">
                                    @{convo.other_user?.username}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <MoreVertical className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">No messages yet</h3>
                            <p className="text-muted-foreground">Start a conversation with someone!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

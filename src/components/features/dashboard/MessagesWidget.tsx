"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, ChevronRight, Send, Plus, ArrowLeft, Search, MessageSquare, DollarSign, Clock } from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

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
    message_type?: 'text' | 'offer';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offer_details?: {
        title: string;
        price: number;
        delivery_days: number;
        status?: 'pending' | 'accepted';
    };
}

interface Conversation {
    id: string;
    other_user: Profile | null;
    last_message: Message | null;
}

export function MessagesWidget() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const chatWithUserId = searchParams.get("chat_with");

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchResults, setSearchResults] = useState<Profile[]>([]);

    // Offer State
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [offerForm, setOfferForm] = useState({ title: "", price: "", days: "" });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        // setLoading(true); // Removed to avoid lint error

        const { data: myConvos, error: myConvosError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (myConvosError || !myConvos || myConvos.length === 0) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const conversationIds = myConvos.map(c => c.conversation_id);

        const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('conversation_id, user_id')
            .in('conversation_id', conversationIds)
            .neq('user_id', user.id);

        if (participantsError || !participants) {
            setLoading(false);
            return;
        }

        const userIds = participants.map(p => p.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        const loadedConversations: Conversation[] = participants.map(p => {
            const profile = profiles?.find(prof => prof.id === p.user_id) || null;
            return {
                id: p.conversation_id,
                other_user: profile,
                last_message: null
            };
        });

        setConversations(loadedConversations);
        setLoading(false);
    }, [user]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        }
    }, []);

    const handleSearchUsers = async () => {
        if (!searchUsername.trim()) return;

        const { data } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .ilike('username', `%${searchUsername}%`)
            .limit(5);

        if (data) {
            setSearchResults(data);
        }
    };

    const startConversation = useCallback(async (otherUserId: string) => {
        if (!user) return;

        const { data: convo } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (convo) {
            await supabase.from('conversation_participants').insert([
                { conversation_id: convo.id, user_id: user.id },
                { conversation_id: convo.id, user_id: otherUserId }
            ]);

            await fetchConversations();
            const otherUser = searchResults.find(r => r.id === otherUserId);
            let targetUser = otherUser || null;

            if (!targetUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherUserId).single();
                if (profile) targetUser = profile;
            }

            setActiveConversation({
                id: convo.id,
                other_user: targetUser,
                last_message: null
            });
            setIsNewChatOpen(false);
        }
    }, [user, fetchConversations, searchResults]);

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchConversations();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user, fetchConversations]);

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
    }, [activeConversation, fetchMessages]);

    // Handle chat_with param
    useEffect(() => {
        if (user && chatWithUserId && !loading) {
            const existingConvo = conversations.find(c => c.other_user?.id === chatWithUserId);
            if (existingConvo) {
                setActiveConversation(existingConvo);
            } else {
                startConversation(chatWithUserId);
            }
        }
    }, [user, chatWithUserId, loading, conversations, startConversation]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || !user) return;

        // Trust & Safety: Keyword Flagging
        // We dynamically import to avoid circular dependencies if any, though not strictly needed here.
        const { containsForbiddenKeywords } = await import("@/lib/safety");
        const safetyCheck = containsForbiddenKeywords(newMessage);

        if (safetyCheck.found) {
            toast(`Message blocked: Contains forbidden keyword "${safetyCheck.keyword}". Please keep communication on the platform.`, "error");
            return;
        }

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: activeConversation.id,
                sender_id: user.id,
                content: newMessage.trim(),
                message_type: 'text'
            });

        if (!error) {
            setNewMessage("");
        }
    };

    const handleSendOffer = async () => {
        if (!offerForm.title || !offerForm.price || !offerForm.days || !activeConversation || !user) return;

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: activeConversation.id,
                sender_id: user.id,
                content: "Custom Offer",
                message_type: 'offer',
                offer_details: {
                    title: offerForm.title,
                    price: parseFloat(offerForm.price),
                    delivery_days: parseInt(offerForm.days),
                    status: 'pending'
                }
            });

        if (!error) {
            setIsOfferModalOpen(false);
            setOfferForm({ title: "", price: "", days: "" });
        }
    };

    const handleAcceptOffer = async (message: Message) => {
        if (!user || !activeConversation || !message.offer_details) return;

        // 1. Create Order
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                buyer_id: user.id,
                seller_id: message.sender_id,
                amount: message.offer_details.price,
                status: 'pending_requirements',
                description: `Custom Offer: ${message.offer_details.title}`,
                // We could link to a generic "Custom Service" if needed, but for now null service_id implies custom
            })
            .select()
            .single();

        if (error) {
            toast("Failed to accept offer", "error");
            return;
        }

        // 2. Update Message Status (Optional, if we want to lock it)
        // await supabase.from('messages').update({ offer_details: { ...message.offer_details, status: 'accepted' } }).eq('id', message.id);

        // 3. Redirect
        router.push(`/orders/${order.id}`);
    };

    if (activeConversation) {
        return (
            <div className="w-full max-w-2xl mx-auto h-[85vh] md:h-[800px] flex flex-col bg-background md:bg-card md:border md:border-border md:rounded-[2.5rem] overflow-hidden md:shadow-2xl relative">
                {/* Chat Header */}
                <div className="p-4 flex items-center gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border">
                    <button onClick={() => setActiveConversation(null)} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                            {activeConversation.other_user?.avatar_url ? (
                                <Image src={activeConversation.other_user.avatar_url} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground leading-tight">{activeConversation.other_user?.full_name || "Unknown User"}</h3>
                            <p className="text-xs text-muted-foreground font-medium">@{activeConversation.other_user?.username}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        const isOffer = msg.message_type === 'offer';

                        return (
                            <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                                {isOffer ? (
                                    <div className={clsx(
                                        "max-w-[85%] rounded-3xl overflow-hidden shadow-sm border",
                                        isMe ? "bg-background border-primary/20" : "bg-background border-border"
                                    )}>
                                        <div className="p-4 bg-muted/30 border-b border-border/50">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                <DollarSign className="w-3 h-3" />
                                                Custom Offer
                                            </div>
                                            <h4 className="font-bold text-lg leading-tight">{msg.offer_details?.title}</h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    {msg.offer_details?.delivery_days} Days Delivery
                                                </div>
                                                <div className="text-xl font-black text-primary">
                                                    ${msg.offer_details?.price}
                                                </div>
                                            </div>
                                            {!isMe && (
                                                <button
                                                    onClick={() => handleAcceptOffer(msg)}
                                                    className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                                >
                                                    Accept Offer
                                                </button>
                                            )}
                                            {isMe && (
                                                <div className="text-center text-xs text-muted-foreground font-medium">
                                                    Offer Sent
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={clsx(
                                        "max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                        isMe
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-card border border-border text-foreground rounded-bl-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border">
                    <div className="flex gap-2 items-end bg-muted/30 p-2 rounded-3xl border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all">
                        <button
                            onClick={() => setIsOfferModalOpen(true)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            title="Create Offer"
                        >
                            <DollarSign className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none px-2 py-2 text-sm focus:ring-0 placeholder:text-muted-foreground/50 max-h-32"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-2 bg-primary text-primary-foreground rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-primary/20"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </div>
                </div>

                {/* Create Offer Modal */}
                {isOfferModalOpen && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-sm rounded-[2rem] border border-border shadow-2xl p-6 animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-xl">Create Custom Offer</h3>
                                <button onClick={() => setIsOfferModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">I will...</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. build your website"
                                        value={offerForm.title}
                                        onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                                        className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Price ($)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={offerForm.price}
                                            onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Delivery (Days)</label>
                                        <input
                                            type="number"
                                            placeholder="3"
                                            value={offerForm.days}
                                            onChange={(e) => setOfferForm({ ...offerForm, days: e.target.value })}
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendOffer}
                                    disabled={!offerForm.title || !offerForm.price || !offerForm.days}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    Send Offer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <h1 className="text-3xl font-black text-foreground tracking-tight">Messages</h1>
                <button
                    onClick={() => setIsNewChatOpen(!isNewChatOpen)}
                    className={clsx(
                        "p-3 rounded-full transition-all shadow-lg",
                        isNewChatOpen ? "bg-muted text-foreground rotate-45" : "bg-primary text-primary-foreground hover:scale-105"
                    )}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* New Chat Area */}
            {isNewChatOpen && (
                <div className="mb-8 p-5 bg-card border border-border rounded-[2rem] animate-in fade-in slide-in-from-top-4 shadow-xl shadow-black/5">
                    <div className="flex items-center gap-3 mb-4 bg-muted/30 p-3 rounded-2xl">
                        <Search className="w-5 h-5 text-muted-foreground ml-1" />
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            placeholder="Search username..."
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                            autoFocus
                        />
                        <button onClick={handleSearchUsers} className="px-4 py-1.5 bg-background rounded-xl font-bold text-xs shadow-sm hover:bg-muted transition-colors">
                            Find
                        </button>
                    </div>

                    <div className="space-y-2">
                        {searchResults.length > 0 ? (
                            searchResults.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => startConversation(profile.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-2xl transition-colors text-left group"
                                >
                                    <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                                        {profile.avatar_url ? (
                                            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{profile.full_name}</div>
                                        <div className="text-xs text-muted-foreground">@{profile.username}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/50" />
                                </button>
                            ))
                        ) : searchUsername && (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Conversation List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map((convo) => (
                        <div
                            key={convo.id}
                            onClick={() => setActiveConversation(convo)}
                            className="bg-muted/30 hover:bg-muted/50 p-4 rounded-[2rem] flex items-center gap-4 transition-all cursor-pointer group active:scale-[0.98]"
                        >
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full bg-background p-0.5 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                <div className="relative w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {convo.other_user?.avatar_url ? (
                                        <Image src={convo.other_user.avatar_url} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <span className="font-bold text-muted-foreground text-lg">
                                            {convo.other_user?.full_name?.charAt(0) || "?"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-foreground tracking-tight mb-0.5 truncate">
                                    {convo.other_user?.full_name || "Unknown User"}
                                </h3>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                    @{convo.other_user?.username}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 space-y-4 opacity-50">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                            <h3 className="font-bold text-lg">No messages yet</h3>
                            <p className="text-muted-foreground text-sm">Start a conversation with someone!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

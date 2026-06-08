"use client"

import * as React from "react"
import { 
  getProviderContacts, getChatHistory, sendMessageAction, getMockProvider,
  uploadChatAttachmentAction, markMessagesAsReadAction, clearChatForUserAction, getGlobalUnreadCount,
  deleteMessageAction, editMessageAction, updatePresenceAction
} from "@/app/actions/chat.actions"
import { chatWithAiAction, getAiHistoryForUser } from "@/app/actions/ai.actions"
import { 
  Send, Search, MoreVertical, ChevronLeft, Info, MessageSquare, Paperclip, Mic,
  Square, FileText, Download, Trash2, Loader2, Pencil, Bell, X, MessageSquareText, Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { toast } from "sonner"
import { pusherClient } from "@/lib/pusher-client"
import { CustomAudioPlayer } from "@/components/chat/CustomAudioPlayer"

export function ChatOverlay() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [contacts, setContacts] = React.useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [providerUser, setProviderUser] = React.useState<any>(null)
  const [view, setView] = React.useState<'list' | 'chat'>('list')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null)
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)
  const [isChatSearching, setIsChatSearching] = React.useState(false)
  const [chatSearchQuery, setChatSearchQuery] = React.useState("")
  const [isMuted, setIsMuted] = React.useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false)
  
  const [activeTab, setActiveTab] = React.useState<'HUMAN' | 'AI'>('HUMAN')
  const [aiMessages, setAiMessages] = React.useState<any[]>([])
  const [isAiTyping, setIsAiTyping] = React.useState(false)
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const aiMessagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!providerUser) return;
    
    let lastPing = 0;
    
    const ping = () => {
      const now = Date.now();
      // Enterprise Check: Only ping if 60 seconds have passed AND the browser tab is actually visible/active
      if (now - lastPing >= 60000 && document.visibilityState === 'visible') {
        updatePresenceAction(providerUser.id);
        lastPing = now;
      }
    };

    // Smart detection: Only track presence if they are interacting with the system
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, ping, { passive: true }));
    
    ping(); // Initial startup ping
    
    // Fallback interval just in case they are reading but not clicking (still respects visibility check)
    const interval = setInterval(ping, 60000); 

    return () => {
      events.forEach(e => window.removeEventListener(e, ping));
      clearInterval(interval);
    };
  }, [providerUser]);

  React.useEffect(() => {
    async function init() {
      const [patientUsers, provider] = await Promise.all([getProviderContacts(), getMockProvider()])
      setContacts(patientUsers)
      setProviderUser(provider)
      if (provider) {
        const count = await getGlobalUnreadCount(provider.id)
        setUnreadCount(count)
      }
      const savedIsOpen = localStorage.getItem('chat_isOpen') === 'true'
      const savedPatientId = localStorage.getItem('chat_selectedPatientId')
      if (savedIsOpen) setIsOpen(true)
      if (savedPatientId && patientUsers.length > 0) {
        const patient = patientUsers.find((p: any) => p.id === savedPatientId)
        if (patient) {
          setSelectedPatient(patient)
          setView('chat')
        }
      }
    }
    init()
  }, [])

  React.useEffect(() => {
    localStorage.setItem('chat_isOpen', isOpen.toString())
    if (selectedPatient) localStorage.setItem('chat_selectedPatientId', selectedPatient.id)
  }, [isOpen, selectedPatient])

  React.useEffect(() => {
    if (!selectedPatient || !providerUser) return
    
    const chatChannelName = [providerUser.id, selectedPatient.id].sort().join('-')
    
    getChatHistory(providerUser.id, selectedPatient.id).then((history) => {
      setMessages(history)
      if (isOpen) markMessagesAsReadAction(providerUser.id, selectedPatient.id)
    })
    
    const channel = pusherClient.subscribe(chatChannelName)
    
    channel.bind('new-message', (data: any) => {
      setMessages(prev => [...prev, data])
      if (isOpen && data.senderId !== providerUser.id) markMessagesAsReadAction(providerUser.id, selectedPatient.id)
      
      // Bump contact to top
      setContacts(prev => {
        const updated = [...prev]
        const idx = updated.findIndex(c => c.id === data.senderId || c.id === data.receiverId)
        if (idx !== -1) {
          const [contact] = updated.splice(idx, 1)
          contact.lastMessageAt = data.createdAt
          updated.unshift(contact)
        }
        return updated
      })
    })
    
    channel.bind('messages-read', (data: any) => {
      if (data.readerId !== providerUser.id) {
        setMessages(prev => prev.map(m => (!m.read && m.senderId === providerUser.id) ? { ...m, read: true, readAt: new Date() } : m))
      }
    })
    
    channel.bind('message-updated', (data: any) => setMessages(prev => prev.map(m => m.id === data.id ? data : m)))
    channel.bind('message-deleted', (data: any) => setMessages(prev => prev.map(m => m.id === data.id ? data : m)))
    
    return () => { 
      pusherClient.unsubscribe(chatChannelName) 
    }
  }, [selectedPatient, providerUser, isOpen])

  React.useEffect(() => {
    if (!providerUser) return
    const interval = setInterval(async () => {
      const [count, updatedContacts] = await Promise.all([
        getGlobalUnreadCount(providerUser.id),
        getProviderContacts()
      ])
      setUnreadCount(count)
      setContacts(updatedContacts)
    }, 300000) // Optimized: 5 minutes polling (Pusher handles real-time)
    return () => clearInterval(interval)
  }, [providerUser])

  React.useEffect(() => {
    if (!providerUser?.id) return;
    async function loadAiHistory() {
      const res = await getAiHistoryForUser(providerUser.id);
      if (res.success && res.data) {
        setAiMessages(res.data);
      }
    }
    loadAiHistory();
  }, [providerUser?.id]);

  React.useEffect(() => {
    if (activeTab === 'HUMAN' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activeTab])

  React.useEffect(() => {
    if (activeTab === 'AI' && aiMessagesEndRef.current) {
      aiMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiMessages, isOpen, activeTab])

  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const handleResize = () => setIsKeyboardOpen(viewport.height < window.innerHeight - 150);
    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  const handleSendAiMessage = async () => {
    if (!newMessage.trim() || isAiTyping || !providerUser) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: newMessage.trim(), isMe: true, createdAt: new Date() };
    setAiMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    setIsAiTyping(true);

    try {
      const res = await chatWithAiAction(providerUser.id, userMsg.content, aiMessages);
      setIsAiTyping(false);

      if (res.success && res.data) {
        const assistantMsg = { id: Date.now().toString() + "ai", role: "assistant", content: res.data, isMe: false, createdAt: new Date() };
        setAiMessages(prev => {
          const hasUserMsg = prev.some(m => m.content === userMsg.content && m.role === "user");
          if (!hasUserMsg) {
            return [...prev, userMsg, assistantMsg];
          }
          return [...prev, assistantMsg];
        });
      } else {
        toast.error(res.error || "AI failed to respond");
      }
    } catch (error) {
      setIsAiTyping(false);
      toast.error("Failed to communicate with AI");
    }
  };

  const handleSendMessage = async (contentToSend?: string, type: string = "TEXT") => {
    const content = contentToSend || newMessage.trim()
    if (!content || !selectedPatient || !providerUser) return
    if (editingMessageId) {
      const res = await editMessageAction(editingMessageId, providerUser.id, content)
      if (res.success) { setEditingMessageId(null); setNewMessage(""); } else toast.error(res.error);
      return
    }
    if (!contentToSend) setNewMessage("")
    // Ensure DB call is awaited and success is checked
    const res = await sendMessageAction(providerUser.id, selectedPatient.id, content, type)
    if (!res.success) {
      toast.error(res.error || "Failed to send message")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedPatient || !providerUser) return
    setIsUploading(true)
    const formData = new FormData(); formData.append('file', file)
    const res = await uploadChatAttachmentAction(formData)
    if (res.success) await handleSendMessage(res.url, res.type)
    else toast.error("Upload failed")
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setIsUploading(true)
        const formData = new FormData(); formData.append('file', file)
        const res = await uploadChatAttachmentAction(formData)
        if (res.success) await handleSendMessage(res.url, "AUDIO")
        setIsUploading(false)
        stream.getTracks().forEach(track => track.stop())
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) { toast.error("Microphone access denied") }
  }

  const stopRecording = () => {
    if (mediaRecorder) { mediaRecorder.stop(); setIsRecording(false); setMediaRecorder(null); }
  }

  const canManageMessage = (msg: any) => {
    if (msg.senderId !== providerUser?.id) return false;
    const now = new Date().getTime();
    const createdAt = new Date(msg.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - createdAt) < fiveMinutes;
  };

  const handleMediaDownload = (url: string) => {
    const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    window.location.href = downloadUrl;
  }

  const renderMessageContent = (msg: any, isMe: boolean) => {
    if (msg.isDeleted) return <span className="italic opacity-50 flex items-center gap-2">🚫 This message was deleted</span>
    switch (msg.type) {
      case "IMAGE": return <img src={msg.content} className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 shadow-sm" alt="Upload" onClick={() => handleMediaDownload(msg.content)} />
      case "AUDIO": return <CustomAudioPlayer src={msg.content} isMe={isMe} />
      case "DOC":
        return (
          <div className={cn("flex items-center gap-3 w-full cursor-pointer", isMe ? "text-white" : "text-slate-700")} onClick={() => handleMediaDownload(msg.content)}>
            <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", isMe ? "bg-white/10" : "bg-black/5")}><FileText className="size-5" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate leading-none mb-1">Clinical Document</p><p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Download</p></div>
            <Download className="size-4 opacity-50 shrink-0" />
          </div>
        )
      default: return msg.content
    }
  }

  const handleClearChat = async () => {
    if (!providerUser || !selectedPatient) return
    const res = await clearChatForUserAction(providerUser.id, selectedPatient.id)
    if (res.success) { setMessages([]); setIsClearDialogOpen(false); toast.success("Chat history cleared"); }
  }

  const formatDateDivider = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    // Example: "October 12, 2026"
    return format(date, DISPLAY_DATE_FORMAT);
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-[200] transition-all duration-500 ease-in-out right-6 cursor-pointer flex items-center justify-center size-14 md:size-16 rounded-full bg-[#67BA2E] shadow-[0_8px_30px_rgb(103,186,46,0.4)] hover:scale-110 active:scale-95 group",
          isKeyboardOpen ? "bottom-4" : "bottom-24 md:bottom-8",
          isOpen && "md:right-[980px] lg:right-[1130px] !bg-slate-800 shadow-xl", // Adjusted for massive width
          isOpen && "max-md:hidden" // Hide on mobile when open
        )}
      >
        {isOpen ? <X className="size-6 md:size-7 text-white animate-in spin-in-90 duration-300" /> : (
          <div className="relative">
            <MessageSquareText className="size-6 md:size-7 text-white fill-none transition-all group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-3 -right-3 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 items-center justify-center text-[10px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Massive Desktop Overlay (Split Screen) + Mobile View */}
      <div className={cn(
        "fixed z-[90] top-0 left-0 w-full h-full md:top-auto md:left-auto md:bottom-8 md:right-8 md:w-[calc(100vw-4rem)] lg:w-[1100px] md:h-[calc(100vh-4rem)] bg-white md:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 ease-in-out transform flex flex-col md:flex-row",
        isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-12 opacity-0 pointer-events-none scale-95"
      )}>
        
        {/* Left Side: Contacts List */}
        <div className={cn(
          "w-full md:w-[320px] lg:w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/20 shrink-0",
          view === 'chat' ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 md:p-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                Messenger <Badge variant="outline" className="bg-[#67BA2E]/10 text-[#67BA2E] text-[10px]">{contacts.length}</Badge>
              </h2>
              {/* Close button for Mobile List View */}
              <Button variant="ghost" size="icon" className="md:hidden -mr-2 text-slate-400" onClick={() => setIsOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => { setActiveTab('HUMAN'); setView('list'); }} 
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'HUMAN' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                🧑‍⚕️ Patients
              </button>
              <button 
                onClick={() => { setActiveTab('AI'); setView('chat'); }} 
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1", activeTab === 'AI' ? "bg-white text-[#67BA2E] shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Sparkles className="size-3" /> SyncMed AI
              </button>
            </div>

            {activeTab === 'HUMAN' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search patients..." className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-xs" />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {activeTab === 'HUMAN' ? (
              contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).map((contact) => (
                <div key={contact.id} onClick={() => { setSelectedPatient(contact); setView('chat'); }} className={cn(
                  "p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 group",
                  selectedPatient?.id === contact.id ? "bg-[#67BA2E] text-white shadow-md" : "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100"
                )}>
                  <Avatar className="size-11 rounded-full border-2 border-white shadow-sm">
                    <AvatarFallback className={cn("font-black text-xs", selectedPatient?.id === contact.id ? "bg-white/20 text-white" : "bg-emerald-50 text-[#67BA2E]")}>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm truncate leading-tight">{contact.firstName} {contact.lastName}</p>
                      {contact.unreadCount > 0 && selectedPatient?.id !== contact.id && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white size-5 flex items-center justify-center rounded-full p-0 text-[10px] shadow-sm ml-2 shrink-0">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-[9px] uppercase font-black tracking-widest truncate mt-0.5", 
                      selectedPatient?.id === contact.id ? "text-white" : (contact.isOnline ? "text-[#67BA2E]" : "text-slate-400")
                    )}>
                      {contact.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                <Sparkles className="size-8 text-[#67BA2E] mb-3" />
                <p className="text-xs font-bold text-slate-500">SyncMed AI acts as a smart assistant for you and your patients.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className={cn("flex-1 flex flex-col bg-white relative", view === 'list' ? "hidden md:flex" : "flex")}>
          {activeTab === 'AI' ? (
            <>
              {/* Header */}
              <div className="p-3 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm shrink-0">
                <div className="flex items-center gap-3 relative z-50">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-[#67BA2E]" onClick={() => setView('list')}><ChevronLeft className="size-6" /></Button>
                  <Avatar className="size-10 border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <Sparkles className="size-5 text-[#67BA2E]" />
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-none mb-1">SyncMed AI</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#67BA2E]">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/10 custom-scrollbar">
                {aiMessages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                    <Sparkles className="size-10 text-[#67BA2E] mb-4" />
                    <p className="text-sm font-bold text-slate-500">I'm SyncMed AI. How can I assist you today?</p>
                  </div>
                )}
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col group", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 max-w-full">
                      <div className={cn(
                        "relative px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] w-full max-w-fit shadow-sm text-[13px] font-medium leading-[1.7] tracking-[0.03em] whitespace-pre-wrap", 
                        msg.role === "user" ? "bg-[#67BA2E] text-white rounded-tr-none ml-auto" : "bg-gradient-to-br from-emerald-50 to-emerald-100 text-slate-800 border border-emerald-200/50 rounded-tl-none mr-auto"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex flex-col group items-start">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 text-slate-800 border border-emerald-200/50 rounded-[1.5rem] rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-[#67BA2E]" />
                      <span className="text-xs font-bold text-slate-500">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* Input */}
              <div className={cn("p-4 bg-white border-t border-slate-100 shrink-0", isKeyboardOpen ? "pb-4" : "pb-6")}>
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full shadow-inner border border-slate-200">
                  <Input 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Ask AI..." 
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                    className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-2 text-sm h-9 tracking-[0.03em] font-medium leading-relaxed" 
                  />
                  <Button size="icon" onClick={handleSendAiMessage} disabled={isAiTyping || !newMessage.trim()} className="bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white size-9 rounded-full shrink-0 flex items-center justify-center"><Send className="size-4 text-white shrink-0" /></Button>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 h-10 md:hidden font-black text-[10px] uppercase tracking-widest text-slate-400 border border-slate-100 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-3 mr-2" /> Close Messenger
                </Button>
              </div>
            </>
          ) : selectedPatient ? (
            <>
              {/* Header with relative z-50 for mobile click fix */}
              <div className="p-3 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm shrink-0">
                <div className="flex items-center gap-3 relative z-50">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-[#67BA2E]" onClick={() => setView('list')}><ChevronLeft className="size-6" /></Button>
                  <Avatar className="size-10 border border-slate-100 shadow-sm"><AvatarFallback className="bg-emerald-50 text-[#67BA2E] font-black">{selectedPatient.firstName[0]}{selectedPatient.lastName[0]}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-none mb-1">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedPatient.isOnline ? "text-[#67BA2E]" : "text-slate-400")}>{selectedPatient.isOnline ? "Online" : "Offline"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-50">
                  <Sheet>
                    <SheetTrigger asChild><Button variant="ghost" size="icon" className="size-8 rounded-full text-slate-400 hover:bg-slate-50"><Info className="size-4" /></Button></SheetTrigger>
                    {/* Using Portal with custom z-index directly on Content if possible, otherwise we update sheet.tsx */}
                    <SheetContent className="w-full sm:w-[400px] border-l-0 sm:border-l p-6 overflow-y-auto z-[110]">
                      <SheetHeader>
                        <SheetTitle>Patient Profile</SheetTitle>
                        <SheetDescription>Clinical details for {selectedPatient.firstName}</SheetDescription>
                      </SheetHeader>
                      <div className="mt-8 flex flex-col items-center">
                        <Avatar className="size-24 rounded-3xl border-4 border-slate-50 shadow-xl mb-4">
                          <AvatarFallback className="bg-[#67BA2E]/10 text-[#67BA2E] font-black text-3xl">{selectedPatient.firstName[0]}{selectedPatient.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-black text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest mt-1", selectedPatient.isOnline ? "text-[#67BA2E]" : "text-slate-400")}>{selectedPatient.isOnline ? "Online" : "Offline"}</span>
                      </div>
                      
                      <div className="mt-8 space-y-3">
                        <div className="flex flex-col bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Email Address</span>
                          <span className="text-sm font-bold text-slate-700">{selectedPatient.email}</span>
                        </div>
                        <div className="flex flex-col bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Date of Birth</span>
                          <span className="text-sm font-bold text-slate-700">{selectedPatient.dob ? format(new Date(selectedPatient.dob), DISPLAY_DATE_FORMAT) : 'Not provided'}</span>
                        </div>
                        <div className="flex flex-col bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Residential Address</span>
                          <span className="text-sm font-bold text-slate-700">{selectedPatient.address || 'Not provided'}</span>
                        </div>
                      </div>

                      <Button className="w-full h-14 mt-8 bg-[#67BA2E] hover:bg-[#67BA2E]/90 shadow-[0_8px_20px_rgb(103,186,46,0.3)] text-white rounded-2xl font-black uppercase tracking-wide transition-all" onClick={() => window.open(`/provider/patients/${selectedPatient.patientProfileId}`, '_self')}>
                        View Full Profile
                      </Button>
                    </SheetContent>
                  </Sheet>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8 rounded-full text-slate-400 hover:bg-slate-50"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl z-[110]">
                      <DropdownMenuItem className="cursor-pointer font-bold text-slate-600 p-2.5" onClick={() => setIsChatSearching(!isChatSearching)}><Search className="size-4 mr-2" /> Search Chat</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer font-bold text-slate-600 p-2.5" onClick={() => setIsMuted(!isMuted)}><Bell className={cn("size-4 mr-2", isMuted && "fill-slate-600")} /> {isMuted ? "Unmute" : "Mute"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer font-bold text-red-500 focus:bg-red-50 p-2.5" onClick={() => setIsClearDialogOpen(true)}><Trash2 className="size-4 mr-2" /> Clear History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {isChatSearching && (
                <div className="px-6 py-3 bg-[#67BA2E]/5 border-b border-[#67BA2E]/10"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#67BA2E]/50" /><Input autoFocus value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} placeholder="Find message..." className="pl-9 h-9 bg-white border-[#67BA2E]/20 rounded-lg text-xs" /><Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-[10px] font-black uppercase text-[#67BA2E]" onClick={() => { setIsChatSearching(false); setChatSearchQuery(""); }}>Esc</Button></div></div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/10 custom-scrollbar">
                {messages.filter(msg => msg.content.toLowerCase().includes(chatSearchQuery.toLowerCase())).map((msg, idx, filteredArray) => {
                  const isMe = msg.senderId === providerUser?.id;
                  
                  // Date Grouping Logic
                  const currentMsgDate = new Date(msg.createdAt).toDateString();
                  const prevMsgDate = idx > 0 ? new Date(filteredArray[idx - 1].createdAt).toDateString() : null;
                  const showDateDivider = currentMsgDate !== prevMsgDate;

                  return (
                    <React.Fragment key={msg.id || idx}>
                      {/* WhatsApp Style Date Badge */}
                      {showDateDivider && (
                        <div className="flex justify-center my-6">
                          <span className="bg-slate-200/60 text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                            {formatDateDivider(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      {/* The existing message container */}
                      <div className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2 max-w-full">
                          {/* 3 Dots Menu */}
                          {isMe && canManageMessage(msg) && !msg.isDeleted && (
                            <div className="opacity-100 transition-opacity shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7 rounded-full text-slate-400"><MoreVertical className="size-3" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-xl z-[120]">
                                  {msg.type === "TEXT" && <DropdownMenuItem className="font-bold text-[11px] p-2" onClick={() => { setEditingMessageId(msg.id); setNewMessage(msg.content); }}><Pencil className="size-3 mr-2" /> Edit</DropdownMenuItem>}
                                  <DropdownMenuItem className="font-bold text-[11px] p-2 text-red-500" onClick={() => deleteMessageAction(msg.id, providerUser.id)}><Trash2 className="size-3 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                          {/* Message Bubble */}
                          <div className={cn(
                            "relative px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] w-full max-w-fit shadow-sm text-[13px] font-medium leading-[1.7] tracking-[0.03em] whitespace-pre-wrap", 
                            isMe ? "bg-[#67BA2E] text-white rounded-tr-none ml-auto" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none mr-auto"
                          )}>
                            {renderMessageContent(msg, isMe)}
                          </div>
                        </div>
                        {/* Time and Ticks */}
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.isEdited && !msg.isDeleted && <span className="text-[9px] font-black text-[#67BA2E] uppercase">• Edited</span>}
                          {isMe && !msg.isDeleted && <span className={cn("text-[9px] font-black uppercase", msg.read ? "text-[#67BA2E]" : "text-slate-400")}>• {msg.read ? "Seen" : "Sent"}</span>}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className={cn("p-4 bg-white border-t border-slate-100 shrink-0", isKeyboardOpen ? "pb-4" : "pb-6")}>
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full shadow-inner border border-slate-200">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="application/pdf,image/*" />
                  <Button variant="ghost" size="icon" className="size-9 text-slate-500 rounded-full shrink-0" onClick={() => fileInputRef.current?.click()} disabled={isUploading}><Paperclip className="size-4" /></Button>
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isRecording ? "Recording..." : "Message..."} disabled={isRecording} className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-2 text-sm h-9 tracking-[0.03em] font-medium leading-relaxed" />
                  <div className="flex items-center gap-1">
                     {isUploading ? <Loader2 className="size-4 animate-spin text-[#67BA2E]" /> : 
                      isRecording ? <Button size="icon" onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white size-9 rounded-full shrink-0 flex items-center justify-center"><Square className="size-4 text-white shrink-0 fill-white" /></Button> :
                      newMessage.trim() ? <Button size="icon" onClick={() => handleSendMessage()} className="bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white size-9 rounded-full shrink-0 flex items-center justify-center"><Send className="size-4 text-white shrink-0" /></Button> :
                      <Button variant="ghost" size="icon" onClick={startRecording} className="text-slate-500 rounded-full"><Mic className="size-4" /></Button>}
                  </div>
                </div>
                {/* Close Messenger bar for mobile */}
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 h-10 md:hidden font-black text-[10px] uppercase tracking-widest text-slate-400 border border-slate-100 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-3 mr-2" /> Close Messenger
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 relative">
               {/* Close button for empty state on mobile */}
               <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 md:hidden text-slate-400"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-6" />
              </Button>
              <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6"><MessageSquare className="size-8" /></div>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Select a Patient</h3>
              <p className="text-sm font-bold text-slate-500 max-w-[250px]">Choose a conversation from the sidebar to begin messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Clear Chat Popup */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-[400px] z-[120]">
          <AlertDialogHeader className="items-center text-center">
            <div className="size-20 rounded-[2rem] bg-red-50 flex items-center justify-center mb-4"><Trash2 className="size-10 text-red-500 animate-pulse" /></div>
            <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">This hides the entire clinical conversation for you. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col gap-2 mt-6">
            <AlertDialogAction onClick={handleClearChat} className="bg-red-500 hover:bg-red-600 text-white h-12 rounded-2xl font-bold w-full">Delete History</AlertDialogAction>
            <AlertDialogCancel className="border-slate-100 bg-slate-50 text-slate-600 h-12 rounded-2xl font-bold w-full mt-0">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

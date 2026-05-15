"use client"

import * as React from "react"
import { Play, Pause, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomAudioPlayerProps {
  src: string
  isMe?: boolean
}

export function CustomAudioPlayer({ src, isMe }: CustomAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const total = audioRef.current.duration
      setProgress((current / total) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl min-w-[240px] transition-all",
      isMe ? "text-white" : "text-slate-700"
    )}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <Button 
        size="icon" 
        className={cn(
          "size-10 rounded-full shrink-0 shadow-sm",
          isMe ? "bg-white text-[#67BA2E] hover:bg-white/90" : "bg-[#67BA2E] text-white"
        )}
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
      </Button>

      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-full bg-slate-200/30 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", isMe ? "bg-white" : "bg-[#67BA2E]")} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
           <span className="text-[9px] font-black uppercase opacity-60">
             {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
           </span>
           <span className="text-[9px] font-black uppercase opacity-60">
             {formatTime(duration)}
           </span>
        </div>
      </div>
      
      <Volume2 className="size-4 opacity-40 mr-1" />
    </div>
  )
}

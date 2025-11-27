"use client";

import { Unlock, Download, Lock } from "lucide-react";
import Image from "next/image";

export interface FileItem {
    id: string;
    name: string;
    thumbnailUrl?: string;
    isLocked: boolean;
    price?: number;
}

interface FileCardProps {
    file: FileItem;
    onUnlock: (file: FileItem) => void;
}

export function FileCard({ file, onUnlock }: FileCardProps) {
    return (
        <div className="relative group aspect-video rounded-3xl overflow-hidden bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            {/* Thumbnail */}
            <div className="absolute inset-0">
                {file.thumbnailUrl ? (
                    <Image
                        src={file.thumbnailUrl}
                        alt={file.name}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                ) : (
                    <div className="w-full h-full placeholder-image bg-muted" />
                )}
            </div>

            {/* Overlay for Locked State */}
            {file.isLocked && (
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-black/30"
                    onClick={() => onUnlock(file)}
                >
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20 shadow-lg">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full">Locked</span>
                </div>
            )}

            {/* Overlay for Unlocked State (Hover) */}
            {!file.isLocked && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg transform hover:scale-110">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-20">
                {!file.isLocked && (
                    <div className="bg-[#30D158] text-white p-1.5 rounded-full shadow-lg">
                        <Unlock className="w-3 h-3" />
                    </div>
                )}
            </div>

            {/* Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-10">
                <h3 className="text-white font-bold text-lg truncate">{file.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">2.4MB</span>
                    <span>•</span>
                    <span>Feb 21, 2025</span>
                </div>
            </div>
        </div>
    );
}

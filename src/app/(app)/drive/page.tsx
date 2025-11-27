"use client";

import { useState, useEffect } from "react";
import { FileCard, FileItem } from "@/components/features/FileCard";
import { PaymentModal } from "@/components/features/PaymentModal";
import { Plus, UploadCloud, Search, SlidersHorizontal, LayoutGrid, List, File as FileIcon, MoreHorizontal, ArrowDown, Folder, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";

// Mock Data Structure
interface CommissionFolder {
  id: string;
  sellerName: string;
  sellerAvatar: string; // Initials or URL
  projectTitle: string;
  pricePaid: number;
  hasNewItems: boolean;
  files: FileItem[];
  lastUpdated: string;
}

const MOCK_FOLDERS: CommissionFolder[] = [
  {
    id: "ORD-2025-001",
    sellerName: "FateCreates",
    sellerAvatar: "FC",
    projectTitle: "Stream Overlay Package",
    pricePaid: 150.00,
    hasNewItems: true,
    lastUpdated: "2 mins ago",
    files: [
      { id: "1", name: "Overlay_Source.psd", isLocked: false, price: 0, thumbnailUrl: "/pokemon-overlay.jpg" },
      { id: "2", name: "Alerts_Pack.zip", isLocked: false, price: 0 },
      { id: "3", name: "Preview_Watermarked.png", isLocked: false, price: 0 },
    ]
  },
  {
    id: "ORD-2025-004",
    sellerName: "TechStart Inc",
    sellerAvatar: "TS",
    projectTitle: "App UI Redesign",
    pricePaid: 450.00,
    hasNewItems: false,
    lastUpdated: "2 days ago",
    files: [
      { id: "4", name: "UI_Kit_v1.fig", isLocked: true, price: 50 },
      { id: "5", name: "Wireframes.pdf", isLocked: false, price: 0 },
    ]
  }
];

export default function ClientDrivePage() {
  const searchParams = useSearchParams();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-open folder from URL
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      setActiveFolderId(orderId);
    }
  }, [searchParams]);

  const activeFolder = MOCK_FOLDERS.find(f => f.id === activeFolderId);

  // Filter folders or files based on search
  const filteredFolders = MOCK_FOLDERS.filter(f =>
    f.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = activeFolder?.files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUnlockClick = (file: FileItem) => {
    setSelectedFile(file);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    // In a real app, update the file status in the folder
    setIsPaymentOpen(false);
    setSelectedFile(null);
    alert("Payment successful! File unlocked.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen relative pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-0 z-40 bg-background/80 backdrop-blur-xl py-4 -mx-6 px-6 border-b border-border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {activeFolderId && (
            <button
              onClick={() => setActiveFolderId(null)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            {activeFolderId ? (
              <>
                <span className="text-muted-foreground font-normal">Files /</span>
                <span>{activeFolder?.projectTitle || "Unknown Project"}</span>
              </>
            ) : (
              "My Files"
            )}
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder={activeFolderId ? "Search in folder..." : "Search projects..."}
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-muted-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-muted-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!activeFolderId ? (
          /* FOLDER LIST VIEW */
          <motion.div
            key="folders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className="bg-card border border-border rounded-3xl p-6 hover:bg-muted/30 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden active:scale-[0.98] duration-300"
              >
                {/* Notification Dot */}
                {folder.hasNewItems && (
                  <div className="absolute top-5 right-5 w-3 h-3 bg-primary rounded-full border-2 border-card z-10 animate-pulse shadow-lg shadow-primary/50" />
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
                    <Folder className="w-7 h-7 fill-current" />
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-9 h-9 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {folder.sellerAvatar}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-foreground mb-1 group-hover:text-primary transition-colors tracking-tight">{folder.projectTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-5 font-medium">by {folder.sellerName}</p>

                  <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {folder.files.length} files • {folder.lastUpdated}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      ${folder.pricePaid.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* FILE LIST VIEW */
          <motion.div
            key="files"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {filteredFiles.length > 0 ? (
              <div className={clsx(
                "gap-4",
                viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "flex flex-col space-y-3"
              )}>
                {filteredFiles.map((file) => (
                  viewMode === "grid" ? (
                    <FileCard
                      key={file.id}
                      file={file}
                      onUnlock={handleUnlockClick}
                    />
                  ) : (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:bg-muted/50 transition-all group hover:shadow-md hover:shadow-black/5 cursor-default">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <FileIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base mb-0.5">{file.name}</div>
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                            <span className={clsx("w-2 h-2 rounded-full", file.isLocked ? "bg-amber-500" : "bg-[#30D158]")} />
                            ${file.price} • {file.isLocked ? "Locked" : "Unlocked"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => file.isLocked ? handleUnlockClick(file) : alert("Downloading...")}
                        className={clsx(
                          "px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95",
                          file.isLocked
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        )}
                      >
                        {file.isLocked ? "Unlock File" : "Download"}
                      </button>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Folder className="w-12 h-12 mb-4 opacity-20" />
                <p>No files found in this folder.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPay={handlePaymentSuccess}
        file={selectedFile}
      />
    </div>
  );
}

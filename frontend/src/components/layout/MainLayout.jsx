import { useState } from 'react'
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function MainLayout({ children }) {
    const [isCommunityListOpen, setIsCommunityListOpen] = useState(true);
    const [isChannelListOpen, setIsChannelListOpen] = useState(true);

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-gray-900">
                {/* LEFT SIDEBAR: Community List */}
                <div className="w-[72px] bg-gray-950 flex flex-col items-center py-3 gap-2">
                    {/* WILL BE POPULATED WITH COMMUNITY ICONS */}
                    <div className="text-gray-400 text-xs">Communities</div>
                </div>

                {/* MIDDLE SIDEBAR: Channel List*/}
                {isChannelListOpen && (
                    <div className="w-60 bg-gray-800 flex flex-col">
                        <div className="h-12 border-b border-gray-700 flex items-center px-4">
                            <h2 className="font-semibold text-white">Community Name</h2>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-2">
                                {/* WILL BE POPULATED WITH CHANNELS */}
                                <div className="text-gray-400 text-sm">Channels</div>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col">
                    {/* Top bar */}
                    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
                        <h1 className="text-white font-semibold"># channel-name</h1>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Study Tools (collapsed by default) */}
                {/* TODO WITH POMODORO TIMER INTEGRATION (MVP) */}
            </div>
        </SidebarProvider>
    )
}
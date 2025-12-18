import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Hash, Volume2, UserPlus } from 'lucide-react'
import axios from '../../api/axios'
import CommunityInviteDialog from './CommunityInviteDialog'

// Channel List displays channels for selected community
export default function ChannelList({
    communityId,
    selectedChannelId,
    onSelectChannel
}) {
    const [community, setCommunity] = useState(null)
    const [channels, setChannels] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showInviteDialog, setShowInviteDialog] = useState(false)

    // When community id changes, fetch channels
    useEffect(() => {
        if (communityId) {
            fetchCommunityDetails()
        } else {
            setCommunity(null)
            setChannels([])
        }
    }, [communityId])

    const fetchCommunityDetails = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await axios.get(`/communities/${communityId}`)

            if (response.data.success) {
                setCommunity(response.data.community)
                setChannels(response.data.channels)

                // Auto select first channel if none selected
                if (response.data.channels.length > 0 && !selectedChannelId) {
                    onSelectChannel(response.data.channels[0])
                }
            }
        } catch (err) {
            console.error('Failed to fetch community details: ', err)
            setError('Failed to load channels')
        } finally {
            setIsLoading(false)
        }
    }

    // Separate channels by type for grouped display (text, voice)
    const textChannels = channels.filter(ch => ch.type === 'text')
    const voiceChannels = channels.filter(ch => ch.type === 'voice')

    // Empty state (no community selected)
    if (!communityId) {
        return (
            <div className="w-60 bg-gray-800 flex flex-col">
                <div className="h-12 border-b border-gray-700 flex items-center px-4">
                    <h2 className="font-semibold text-white">{community?.name || 'Community'}</h2>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-400 text-sm text-center">
                        Choose a community to view its channels
                    </p>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="w-60 bg-gray-800 flex flex-col">
                <div className="h-12 border-b border-gray-700 flex items-center px-4">
                    <h2 className="font-semibold text-white">Loading...</h2>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="w-60 bg-gray-800 flex flex-col">
                <div className="h-12 border-b border-gray-700 flex items-center px-4">
                    <h2 className="font-semibold text-white">Error</h2>
                </div>
                <div className="flex-1 p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="w-60 bg-gray-800 flex flex-col">
                {/* Community Header */}
                <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4">
                    <h2 className="font-semibold text-white truncate flex-1">
                        {community?.name || 'Community'}
                    </h2>

                    {/* Invite Button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowInviteDialog(true)}
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        title="Invite Friends"
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Channel List */}
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {/* Text Channels Section */}
                        {textChannels.length > 0 && (
                            <>
                                <div className="px-2 py-1">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase">
                                        Text Channels
                                    </h3>
                                </div>
                                {textChannels.map(channel => (
                                    <ChannelItem
                                        key={channel.id}
                                        channel={channel}
                                        isSelected={selectedChannelId === channel.id}
                                        onSelect={() => onSelectChannel(channel)}
                                        icon={<Hash className="h-4 w-4" />}
                                    />
                                ))}
                            </>
                        )}

                        {/* Separator between text and voice */}
                        {textChannels.length > 0 && voiceChannels.length > 0 && (
                            <Separator className="my-2" />
                        )}

                        {/* Voice Channels Section */}
                        {voiceChannels.length > 0 && (
                            <>
                                <div className="px-2 py-1">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase">
                                        Voice Channels
                                    </h3>
                                </div>
                                {voiceChannels.map(channel => (
                                    <ChannelItem
                                        key={channel.id}
                                        channel={channel}
                                        isSelected={selectedChannelId === channel.id}
                                        onSelect={() => onSelectChannel(channel)}
                                        icon={<Volume2 className="h-4 w-4" />}
                                    />
                                ))}
                            </>
                        )}

                        {/* Empty state */}
                        {channels.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-gray-400 text-sm">No channels yet</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Invite Dialog - NEW */}
            {community && (
                <CommunityInviteDialog
                    open={showInviteDialog}
                    onOpenChange={setShowInviteDialog}
                    inviteCode={community.invite_code}
                />
            )}
        </>
    )
}

function ChannelItem({ channel, isSelected, onSelect, icon }) {
    return (
        <button
            onClick={onSelect}
            className={`
        w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors
        ${isSelected
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                }
    `}
        >
            {icon}
            <span className="truncate">{channel.name}</span>
        </button>
    )
}
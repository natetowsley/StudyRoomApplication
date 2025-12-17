import { useState } from 'react'
import CommunityList from '@/components/community/CommunityList'
import CreateCommunityDialog from '@/components/community/CreateCommunityDialog'
import ChannelList from '@/components/community/ChannelList'

export default function Dashboard() {
  const [selectedCommunityId, setSelectedCommunityId] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  // Track communities here too
  const [communities, setCommunities] = useState([])

  const handleSelectCommunity = (communityId) => {
    console.log('Selected community:', communityId)
    setSelectedCommunityId(communityId)
  }

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel)
  }

  const handleCreateCommunity = () => {
    setIsCreateDialogOpen(true)
  }

  // Handle successfull community creation
  const handleCommunityCreated = (newCommunity) => {
    console.log('Community created:', newCommunity)

    // Add community to local list
    setCommunities(prev => [...prev, newCommunity])

    // Auto select new community
    setSelectedCommunityId(newCommunity.id)
  }

  return (
    <>
      <div className="flex h-screen w-full bg-gray-900">
        {/* LEFT SIDEBAR: Community List */}
        <CommunityList
          selectedCommunityId={selectedCommunityId}
          onSelectCommunity={handleSelectCommunity}
          onCreateCommunity={handleCreateCommunity}
        />

        {/* MIDDLE SIDEBAR: Channel List (Placeholder) */}
        <ChannelList
          communityId={selectedCommunityId}
          selectedChannelId={selectedChannel?.id}
          onSelectChannel={handleSelectChannel}
        />

        {/* MAIN CONTENT AREA (Placeholder) */}
        <div className="flex-1 flex flex-col">
          <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
            <h1 className="text-white font-semibold">
              {selectedChannel ? (
                <>
                  {selectedChannel.type === 'text' ? '# ' : '🔊 '}
                  {selectedChannel.name}
                </>
              ) : (
                'Select a channel'
              )}
            </h1>
          </div>
          <div className="flex-1 p-4">
            {selectedChannel ? (
              <div className="text-gray-400">
                <p>Channel: {selectedChannel.name}</p>
                <p>Type: {selectedChannel.type}</p>
                <p className="mt-4">Messages will appear here in Week 3</p>
              </div>
            ) : (
              <p className="text-gray-400">Select a channel to start</p>
            )}
          </div>
        </div>
        </div>

      <CreateCommunityDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCommunityCreated={handleCommunityCreated}
      />
    </>
  )
}
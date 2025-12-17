import { useState } from 'react'
import CommunityList from '@/components/community/CommunityList';

export default function Dashboard() {
  const [selectedCommunityId, setSelectedCommunityId] = useState(null)

  const handleSelectCommunity = (communityId) => {
    console.log('Selected community:', communityId)
    setSelectedCommunityId(communityId)
  }

  const handleCreateCommunity = () => {
    console.log('Create community clicked')
    // TODO: Open create community modal
  }

  return (
    <div className="flex h-screen w-full bg-gray-900">
      {/* LEFT SIDEBAR: Community List */}
      <CommunityList
        selectedCommunityId={selectedCommunityId}
        onSelectCommunity={handleSelectCommunity}
        onCreateCommunity={handleCreateCommunity}
      />

      {/* MIDDLE SIDEBAR: Channel List (Placeholder) */}
      <div className="w-60 bg-gray-800 flex flex-col">
        <div className="h-12 border-b border-gray-700 flex items-center px-4">
          <h2 className="font-semibold text-white">
            {selectedCommunityId ? 'Community Selected' : 'Select a Community'}
          </h2>
        </div>
        <div className="flex-1 p-4">
          <p className="text-gray-400 text-sm">
            {selectedCommunityId
              ? `Viewing community ID: ${selectedCommunityId}`
              : 'Click a community to view channels'}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA (Placeholder) */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <h1 className="text-white font-semibold"># general</h1>
        </div>
        <div className="flex-1 p-4">
          <p className="text-gray-400">Main content area - messages will appear here</p>
        </div>
      </div>
    </div>

  )
}
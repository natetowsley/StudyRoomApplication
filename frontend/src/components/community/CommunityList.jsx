import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from '@/api/axios'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CommunityList({ selectedCommunityId, onSelectCommunity, onCreateCommunity }) {
    const { user } = useAuth()
    const [communities, setCommunities] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchCommunities()
    }, {})

    const fetchCommunities = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await axios.get('/communities')

            if (response.data.success) {
                setCommunities(response.data.communities)

                if (response.data.communities.length > 0 && !selectedCommunityId) {
                    onSelectCommunity(response.data.communities[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch communities: ', error)
            setError('Failed to load communities')
        } finally {
            setIsLoading(false)
        }
    }

    const getInitials = (name) => {
        const words = name.trim().split(' ')
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    if (isLoading) {
        return (
            <div className="w-[72px] bg-gray-950 flex flex-col items-center py-3">
                <div className="text-gray-400 text-xs">Loading...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-[72px] bg-gray-950 flex flex-col items-center py-3">
                <div className="text-red-400 text-xs text-center px-2">{error}</div>
            </div>
        )
    }

    return (
        <div className="w-[72px] bg-gray-950 flex flex-col items-center py-3 gap-2">
            {/* Community Icons */}
            {communities.map((community) => (
                <button
                    key={community.id}
                    onClick={() => onSelectCommunity(community.id)}
                    className={`
            relative group
            transition-all duration-200
            ${selectedCommunityId === community.id
                            ? 'rounded-2xl'
                            : 'rounded-3xl hover:rounded-2xl'
                        }
          `}
                    title={community.name}
                >
                    {/* Active indicator (left bar) */}
                    {selectedCommunityId === community.id && (
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r" />
                    )}

                    <Avatar className="h-12 w-12">
                        <AvatarFallback className={`
              text-white font-semibold
              ${selectedCommunityId === community.id
                                ? 'bg-blue-600'
                                : 'bg-gray-700 group-hover:bg-blue-500'
                            }
            `}>
                            {getInitials(community.name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            ))}

            {/* Separator */}
            {communities.length > 0 && (
                <div className="w-8 h-[2px] bg-gray-700 rounded my-1" />
            )}

            {/* Add Community Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onCreateCommunity}
                className="h-12 w-12 rounded-3xl hover:rounded-2xl bg-gray-700 hover:bg-green-600 text-green-500 hover:text-white transition-all"
                title="Create Community"
            >
                <Plus className="h-6 w-6" />
            </Button>
        </div>
    )
}
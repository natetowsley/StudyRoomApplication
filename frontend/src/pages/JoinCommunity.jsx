import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import axios from '@/api/axios'

// Join community page handles invite link joins
// URL Pattern: /join/:inviteCode

export default function JoinCommunity() {
    const { inviteCode } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Fetch community preview on mount
    useEffect(() => {
        if (inviteCode) {
            fetchCommunityPreview()
        }
    }, [inviteCode]);

    // Fetch community details without joining
    const fetchCommunityPreview = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // TODO, develop GET /communities/preview/:code endpoint

            setIsLoading(false)
        } catch (err) {
            console.error('Failed to fetch community preview', err)
            setError('Invalid invite link')
            setIsLoading(false)
        }
    }

    // Join community
    const handleJoin = async () => {
        try {
            setIsJoining(true)
            setError(null)

            const response = await axios.post('/communities/join', {
                inviteCode: inviteCode
            })

            if (response.data.success) {
                setCommunity(response.data.community)
                setSuccess(true)

                // Redirect to dashboard after join
                setTimeout(() => {
                    navigate('/dashboard', {
                        state: { selectedCommunityId: response.data.community.id }
                    })
                }, 2000)
            }
        } catch (err) {
            console.error('Failed to join community: ', err)
            const errorMessage = err.response?.data?.message || 'Failed to join community'
            setError(errorMessage)
        } finally {
            setIsJoining(false)
        }
    }

    // Cancel and go back to dashboard
    const handleCancel = () => {
        navigate('/dashboard')
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-gray-400">Loading community...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Success state
    if (success && community) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <CardTitle>Successfully Joined!</CardTitle>
                        </div>
                        <CardDescription>
                            You're now a member of {community.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm">
                            Redirecting to community...
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-red-500" />
                            <CardTitle>Cannot Join Community</CardTitle>
                        </div>
                        <CardDescription className="text-red-400">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleCancel} variant="outline" className="w-full">
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Join prompt
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join Community</CardTitle>
                    <CardDescription>
                        You've been invited to join a study community
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-800 border border-gray-700 rounded p-4">
                        <p className="text-sm text-gray-400 mb-1">Invite Code:</p>
                        <p className="text-white font-mono">{inviteCode}</p>
                    </div>

                    <p className="text-sm text-gray-400">
                        Click "Join" to become a member of this community. You'll be able to:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                        <li>Access text and voice channels</li>
                        <li>Participate in study sessions</li>
                        <li>Use shared Pomodoro timers</li>
                        <li>Collaborate with other members</li>
                    </ul>

                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            disabled={isJoining}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleJoin}
                            disabled={isJoining}
                            className="flex-1"
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                'Join Community'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
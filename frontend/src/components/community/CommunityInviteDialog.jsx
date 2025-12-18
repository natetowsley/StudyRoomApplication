// @ts-nocheck
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Copy } from 'lucide-react'

// Community invite dialog (shows invite link for sharing)
export default function CommunityInviteDialog({ open, onOpenChange, inviteCode }) {
    const [copied, setCopied] = useState(false)

    // Copy invite link to clipboard
    const handleCopy = async () => {
        const inviteLink = `${window.location.origin}/join/${inviteCode}`

        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopied(true)

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const inviteLink = `${window.location.origin}/join/${inviteCode}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Friends</DialogTitle>
                    <DialogDescription>
                        Share this link with friends to invite them to your community
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Invite Link Display */}
                    <div className="flex gap-2">
                        <Input
                            value={inviteLink}
                            readOnly
                            className="flex-1"
                            onClick={(e) => e.target.select()} // Select all on click
                        />
                        <Button
                            onClick={handleCopy}
                            size="icon"
                            variant={copied ? "default" : "outline"}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Invite Code Display */}
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Or share the invite code:</p>
                        <div className="bg-gray-800 border border-gray-700 rounded text-white p-3">
                            <p className="text-center font-mono text-lg">{inviteCode}</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                        <p className="text-sm text-blue-400">
                            ⓘ Friends must be logged in to join via this link
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// @ts-nocheck
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import axios from '../../api/axios'

// Create Channel Dialog
export default function CreateChannelDialog({
    open,
    onOpenChange,
    communityId,
    onChannelCreated
}) {
    const [name, setName] = useState('')
    const [type, setType] = useState('text')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate name contains characters (not empty, not only whitespace)
        if (!name.trim()) {
            setError('Channel name is required')
            return
        }

        // Validate text channel name (no spaces)
        if (type === 'text' && name.includes(' ')) {
            setError('Text channel names cannot contain spaces')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await axios.post(`/communities/${communityId}/channels`, {
                name: name.trim(),
                type
            })

            if(response.data.success) {
                onChannelCreated(response.data.channel)

                // Reset form
                setName('')
                setType('text')

                // Close dialog
                onOpenChange(false)
            }
        } catch (err) {
            console.error('Failed to create channel: ', err)
            setError(err.response?.data?.message || 'Failed to create channel')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            setName('')
            setType('text')
            setError(null)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Add a new text or voice channel to your community
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/*Channel type*/}
                        <div className="grid gap-2">
                            <Label>Channel Type</Label>
                            <RadioGroup value={type} onValueChange={setType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="text" id="text" />
                                    <Label htmlFor="text" className="font-normal cursor-pointer">
                                        # Text Channel
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="voice" id="voice"/>
                                    <Label htmlFor="voice" className="font-normal cursor-pointer">
                                        🔊 Voice Channel
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Channel Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Channel Name <span className="text-red-500">*</span>
                            </Label>
                            <Input 
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={
                                    type === 'text'
                                        ? 'e.g., homework-help'
                                        : 'e.g., Study Room'
                                }
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-400">
                                {type === 'text'
                                    ? 'Text channels: lowercase, no spaces, use hyphens'
                                    : 'Voice channels: any format allowed'
                                }
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-3">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Channel'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
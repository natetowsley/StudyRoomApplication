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
import axios from '../../api/axios'
import { ReceiptRussianRuble } from 'lucide-react'

export default function CreateCommunityDialog({ open, onOpenChange, onCommunityCreated }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Handle form submission
    const handleSubmit = async (e) => {
        // Prevent page reload
        e.preventDefault()

        if (!name.trim()) {
            setError('Community name is required')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await axios.post('/communities', {
                name: name.trim(),
                description: description.trim()
            })

            if (response.data.success) {
                // Notify parent that community was created
                onCommunityCreated(response.data.community)

                // Reset form
                setName('')
                setDescription('')

                // Close dialog
                onOpenChange(false)
            }
        } catch (err) {
            console.error('Failed to create community: ', err)
            setError(err.response?.data?.message || 'Failed to create community')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle dialog close
    const handleClose = () => {
        if (!isLoading) {
            setName('')
            setDescription('')
            setError(null)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Community</DialogTitle>
                    <DialogDescription>
                        Create a new study community. You can invite up to 10 members
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/*Community Name*/}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Community Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., CSUMB Study Group"
                                disabled={isLoading}
                                className="col-span-3"
                            />
                        </div>

                        {/* Description (optional) */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., For Biology 101 students"
                                disabled={isLoading}
                            />
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
                            {isLoading ? 'Creating...' : 'Create Community'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
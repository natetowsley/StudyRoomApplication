import { useState } from 'react'
import CreateChannelDialog from '@/components/community/CreateChannelDialog'
import { Button } from '@/components/ui/button'

export default function ComponentPlayground() {
  const [open, setOpen] = useState(true)

  return (
    <div className="p-10">
      <Button onClick={() => setOpen(true)}>
        Open dialog
      </Button>

      <CreateChannelDialog
        open={open}
        onOpenChange={setOpen}
        communityId={1}
        onChannelCreated={(channel) =>
          console.log('Mock channel created:', channel)
        }
      />
    </div>
  )
}
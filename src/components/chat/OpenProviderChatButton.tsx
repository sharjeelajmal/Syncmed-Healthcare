"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { openPatientChat } from "@/lib/patient-chat"

type OpenProviderChatButtonProps = React.ComponentProps<typeof Button> & {
  providerUserId: string
}

export function OpenProviderChatButton({
  providerUserId,
  onClick,
  children,
  ...props
}: OpenProviderChatButtonProps) {
  return (
    <Button
      type="button"
      {...props}
      onClick={(event) => {
        openPatientChat(providerUserId)
        onClick?.(event)
      }}
    >
      {children}
    </Button>
  )
}

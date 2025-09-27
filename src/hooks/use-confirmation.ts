'use client'

import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}

interface ConfirmationDialogState extends ConfirmationOptions {
  isOpen: boolean
  resolve: ((value: boolean) => void) | null
}

const defaultState: ConfirmationDialogState = {
  isOpen: false,
  title: '',
  description: '',
  resolve: null,
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationDialogState>(defaultState)

  const openConfirmation = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    if (state.resolve) {
      state.resolve(false)
    }
    setState(defaultState)
  }, [state])

  const handleConfirm = useCallback(() => {
    if (state.resolve) {
      state.resolve(true)
    }
    setState(defaultState)
  }, [state])

  return {
    ...state,
    openConfirmation,
    onClose: handleClose,
    onConfirm: handleConfirm,
  }
}
"use client"

import type React from "react"
import { createContext, useContext, useReducer } from "react"

// Types
interface Offer {
  id: string
  talentId: string
  talentName: string
  projectTitle: string
  projectDescription: string
  projectType: "fixed" | "hourly"
  budget: number
  timeline: string
  skills: string[]
  status: "draft" | "sent" | "accepted" | "rejected" | "completed"
  createdAt: string
  updatedAt: string
  messages: OfferMessage[]
}

interface OfferMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  type: "message" | "system"
}

interface OfferDraft {
  talentId: string
  talentName: string
  projectTitle: string
  projectDescription: string
  projectType: "fixed" | "hourly"
  budget: number
  timeline: string
  skills: string[]
}

interface OfferState {
  offers: Offer[]
  currentDraft: OfferDraft | null
  selectedOffer: Offer | null
  loading: boolean
  error: string | null
}

type OfferAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_OFFERS"; payload: Offer[] }
  | { type: "ADD_OFFER"; payload: Offer }
  | { type: "UPDATE_OFFER"; payload: Offer }
  | { type: "SET_CURRENT_DRAFT"; payload: OfferDraft | null }
  | { type: "UPDATE_DRAFT"; payload: Partial<OfferDraft> }
  | { type: "SET_SELECTED_OFFER"; payload: Offer | null }
  | { type: "ADD_MESSAGE"; payload: { offerId: string; message: OfferMessage } }

const initialState: OfferState = {
  offers: [],
  currentDraft: null,
  selectedOffer: null,
  loading: false,
  error: null,
}

function offerReducer(state: OfferState, action: OfferAction): OfferState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_OFFERS":
      return { ...state, offers: action.payload }
    case "ADD_OFFER":
      return { ...state, offers: [...state.offers, action.payload] }
    case "UPDATE_OFFER":
      return {
        ...state,
        offers: state.offers.map((offer) => (offer.id === action.payload.id ? action.payload : offer)),
      }
    case "SET_CURRENT_DRAFT":
      return { ...state, currentDraft: action.payload }
    case "UPDATE_DRAFT":
      return {
        ...state,
        currentDraft: state.currentDraft ? { ...state.currentDraft, ...action.payload } : null,
      }
    case "SET_SELECTED_OFFER":
      return { ...state, selectedOffer: action.payload }
    case "ADD_MESSAGE":
      return {
        ...state,
        offers: state.offers.map((offer) =>
          offer.id === action.payload.offerId
            ? { ...offer, messages: [...offer.messages, action.payload.message] }
            : offer,
        ),
        selectedOffer:
          state.selectedOffer?.id === action.payload.offerId
            ? { ...state.selectedOffer, messages: [...state.selectedOffer.messages, action.payload.message] }
            : state.selectedOffer,
      }
    default:
      return state
  }
}

const OfferContext = createContext<{
  state: OfferState
  dispatch: React.Dispatch<OfferAction>
  actions: {
    createDraft: (talentId: string, talentName: string) => void
    updateDraft: (updates: Partial<OfferDraft>) => void
    sendOffer: () => Promise<string>
    fetchOffers: () => Promise<void>
    fetchOfferById: (id: string) => Promise<void>
    updateOfferStatus: (id: string, status: Offer["status"]) => Promise<void>
    sendMessage: (offerId: string, message: string) => Promise<void>
    clearDraft: () => void
  }
} | null>(null)

export function OfferProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(offerReducer, initialState)

  const createDraft = (talentId: string, talentName: string) => {
    const draft: OfferDraft = {
      talentId,
      talentName,
      projectTitle: "",
      projectDescription: "",
      projectType: "fixed",
      budget: 0,
      timeline: "",
      skills: [],
    }
    dispatch({ type: "SET_CURRENT_DRAFT", payload: draft })
  }

  const updateDraft = (updates: Partial<OfferDraft>) => {
    dispatch({ type: "UPDATE_DRAFT", payload: updates })
  }

  const sendOffer = async (): Promise<string> => {
    if (!state.currentDraft) throw new Error("No draft to send")

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newOffer: Offer = {
        id: `offer-${Date.now()}`,
        ...state.currentDraft,
        status: "sent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      }

      dispatch({ type: "ADD_OFFER", payload: newOffer })
      dispatch({ type: "SET_CURRENT_DRAFT", payload: null })
      dispatch({ type: "SET_ERROR", payload: null })

      return newOffer.id
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to send offer" })
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchOffers = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Mock offers data
      const mockOffers: Offer[] = []
      dispatch({ type: "SET_OFFERS", payload: mockOffers })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch offers" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchOfferById = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const offer = state.offers.find((o) => o.id === id)
      if (offer) {
        dispatch({ type: "SET_SELECTED_OFFER", payload: offer })
        dispatch({ type: "SET_ERROR", payload: null })
      } else {
        dispatch({ type: "SET_ERROR", payload: "Offer not found" })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch offer details" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateOfferStatus = async (id: string, status: Offer["status"]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const updatedOffer = state.offers.find((o) => o.id === id)
      if (updatedOffer) {
        const updated = { ...updatedOffer, status, updatedAt: new Date().toISOString() }
        dispatch({ type: "UPDATE_OFFER", payload: updated })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update offer status" })
    }
  }

  const sendMessage = async (offerId: string, message: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newMessage: OfferMessage = {
        id: `msg-${Date.now()}`,
        senderId: "current-user",
        senderName: "You",
        message,
        timestamp: new Date().toISOString(),
        type: "message",
      }
      dispatch({ type: "ADD_MESSAGE", payload: { offerId, message: newMessage } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to send message" })
    }
  }

  const clearDraft = () => {
    dispatch({ type: "SET_CURRENT_DRAFT", payload: null })
  }

  const actions = {
    createDraft,
    updateDraft,
    sendOffer,
    fetchOffers,
    fetchOfferById,
    updateOfferStatus,
    sendMessage,
    clearDraft,
  }

  return <OfferContext.Provider value={{ state, dispatch, actions }}>{children}</OfferContext.Provider>
}

export function useOffer() {
  const context = useContext(OfferContext)
  if (!context) {
    throw new Error("useOffer must be used within an OfferProvider")
  }
  return context
}

export type { Offer, OfferMessage, OfferDraft }

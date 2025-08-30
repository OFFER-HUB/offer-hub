"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { talentProfileData as talentMockData } from "../mockData/talent-mock-data"

// Types
interface Skill {
  name: string
  color: string
}

interface Talent {
  id: number
  name: string
  title: string
  location: string
  category: string
  rating: number
  hourlyRate: number
  avatar: string
  skills: Skill[]
  description: string
  actionText: string
}

interface PortfolioItem {
  id: number
  title: string
  description: string
  image: string
  date: string
  category: string
}

interface Review {
  id: number
  clientName: string
  rating: number
  comment: string
  date: string
  projectTitle?: string
}

interface TalentProfile extends Talent {
  bio: string
  experience: string
  education: string
  languages: string[]
  availability: string
  responseTime: string
  completedProjects: number
  portfolio: PortfolioItem[]
  reviews: Review[]
}

interface TalentFilters {
  skills: string[]
  location: string[]
  hourlyRateMin: number
  hourlyRateMax: number
  rating: number
  availability: boolean
  experience: string[]
  category: string[]
}

interface TalentState {
  talents: TalentProfile[]
  filteredTalents: TalentProfile[]
  selectedTalent: TalentProfile | null
  filters: TalentFilters
  searchQuery: string
  loading: boolean
  error: string | null
  savedTalents: number[]
}

type TalentAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TALENTS"; payload: TalentProfile[] }
  | { type: "SET_FILTERED_TALENTS"; payload: TalentProfile[] }
  | { type: "SET_SELECTED_TALENT"; payload: TalentProfile | null }
  | { type: "SET_FILTERS"; payload: Partial<TalentFilters> }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "TOGGLE_SAVE_TALENT"; payload: number }
  | { type: "APPLY_FILTERS" }

const initialState: TalentState = {
  talents: [],
  filteredTalents: [],
  selectedTalent: null,
  filters: {
    skills: [],
    location: [],
    hourlyRateMin: 0,
    hourlyRateMax: 200,
    rating: 0,
    availability: false,
    experience: [],
    category: [],
  },
  searchQuery: "",
  loading: false,
  error: null,
  savedTalents: [],
}

function talentReducer(state: TalentState, action: TalentAction): TalentState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_TALENTS":
      return { ...state, talents: action.payload, filteredTalents: action.payload }
    case "SET_FILTERED_TALENTS":
      return { ...state, filteredTalents: action.payload }
    case "SET_SELECTED_TALENT":
      return { ...state, selectedTalent: action.payload }
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }
    case "TOGGLE_SAVE_TALENT":
      const talentId = action.payload
      const isSaved = state.savedTalents.includes(talentId)
      return {
        ...state,
        savedTalents: isSaved ? state.savedTalents.filter((id) => id !== talentId) : [...state.savedTalents, talentId],
      }
    case "APPLY_FILTERS":
      const filtered = state.talents.filter((talent) => {
        // Search query filter
        if (
          state.searchQuery &&
          !talent.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !talent.title.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
          !talent.skills.some((skill) => skill.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
        ) {
          return false
        }

        // Skills filter
        if (
          state.filters.skills.length > 0 &&
          !state.filters.skills.some((skill) => talent.skills.some((s) => s.name === skill))
        ) {
          return false
        }

        // Location filter
        if (state.filters.location.length > 0 && !state.filters.location.includes(talent.location)) {
          return false
        }

        // Category filter
        if (state.filters.category.length > 0 && !state.filters.category.includes(talent.category)) {
          return false
        }

        // Hourly rate filter
        if (talent.hourlyRate < state.filters.hourlyRateMin || talent.hourlyRate > state.filters.hourlyRateMax) {
          return false
        }

        // Rating filter
        if (talent.rating < state.filters.rating) {
          return false
        }

        // Availability filter - check if talent has availability info
        if (state.filters.availability && (!talent.availability || talent.availability === "")) {
          return false
        }

        return true
      })
      return { ...state, filteredTalents: filtered }
    default:
      return state
  }
}

const TalentContext = createContext<{
  state: TalentState
  dispatch: React.Dispatch<TalentAction>
  actions: {
    fetchTalents: () => Promise<void>
    fetchTalentById: (id: number) => Promise<void>
    updateFilters: (filters: Partial<TalentFilters>) => void
    updateSearchQuery: (query: string) => void
    toggleSaveTalent: (id: number) => void
    applyFilters: () => void
  }
} | null>(null)

export function TalentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(talentReducer, initialState)

  const fetchTalents = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      dispatch({ type: "SET_TALENTS", payload: talentMockData })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch talents" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchTalentById = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const talent = talentMockData.find((t) => t.id === id)
      if (talent) {
        dispatch({ type: "SET_SELECTED_TALENT", payload: talent })
        dispatch({ type: "SET_ERROR", payload: null })
      } else {
        dispatch({ type: "SET_ERROR", payload: "Talent not found" })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch talent details" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateFilters = (filters: Partial<TalentFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }

  const updateSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })
  }

  const toggleSaveTalent = (id: number) => {
    dispatch({ type: "TOGGLE_SAVE_TALENT", payload: id })
  }

  const applyFilters = () => {
    dispatch({ type: "APPLY_FILTERS" })
  }

  useEffect(() => {
    applyFilters()
  }, [state.searchQuery, state.filters])

  const actions = {
    fetchTalents,
    fetchTalentById,
    updateFilters,
    updateSearchQuery,
    toggleSaveTalent,
    applyFilters,
  }

  return <TalentContext.Provider value={{ state, dispatch, actions }}>{children}</TalentContext.Provider>
}

export function useTalent() {
  const context = useContext(TalentContext)
  if (!context) {
    throw new Error("useTalent must be used within a TalentProvider")
  }
  return context
}

export type { Talent, TalentProfile, PortfolioItem, Review, TalentFilters, Skill }

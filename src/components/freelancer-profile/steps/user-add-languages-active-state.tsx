'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Trash, ArrowLeft, Plus } from 'lucide-react'
import type { ProfileStepProps, Language, LanguageLevel } from '@/app/types/freelancer-profile'
import { Button } from '@/components/ui/button'
import Footer from '../footer'

const languageLevels: LanguageLevel[] = ['Basic', 'Conversational', 'Fluent', 'Native or Bilingual']
const languageOptions = [
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Arabic',
  'Hindi',
  'Italian',
  'Dutch',
  'Korean',
  'Turkish',
  'Swedish',
  'Polish',
  'Vietnamese',
  'Catalan',
  'Valencian',
]
const levelDescriptions: Record<LanguageLevel, string> = {
  Basic: 'I know the basics in this language',
  Conversational: 'I write and speak clearly in this language',
  Fluent: 'I write and speak easily in this language',
  'Native or Bilingual': 'I write and speak fluently in this language',
  'My Level is': 'Select your proficiency level',
}

const UserAddLanguagesActiveState = ({ userData, updateUserData, nextStep, prevStep }: ProfileStepProps) => {
  const languages = userData.languages || []
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredLanguages = languageOptions.filter(
    (lang) => lang.toLowerCase().includes(searchQuery.toLowerCase()) && !languages.some((l) => l.name === lang),
  )

  const addLanguage = (langName: string) => {
    if (languages.some((lang) => lang.name === langName)) return
    const newLang: Language = { id: Date.now().toString(), name: langName, level: 'My Level is' }
    updateUserData({ languages: [...languages, newLang] })
    setIsLanguageDropdownOpen(false)
    setSearchQuery('')
  }

  const removeLanguage = (id: string) => {
    updateUserData({ languages: languages.filter((lang) => lang.id !== id) })
  }

  const updateLanguageLevel = (id: string, level: LanguageLevel) => {
    updateUserData({ languages: languages.map((lang) => (lang.id === id ? { ...lang, level } : lang)) })
    setIsLevelDropdownOpen(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
        setIsLevelDropdownOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='flex flex-col w-full pb-28'>
      <div className='flex-1 mx-auto max-w-4xl p-4'>
        <div className='space-y-3'>
          <p className='text-lg text-[#6D758F] mb-2'>7/11</p>
          <h1 className='text-3xl text-[#002333] font-medium mb-2'>
            Looking good. Next, tell us which languages you speak.
          </h1>
          <p className='text-[#6D758F] text-lg mb-8'>
            OfferHub is global, so clients are often interested to know what languages you speak. English is a must, but
            do you speak any other languages?
          </p>
        </div>
        <div className='w-full my-6 border-t border-[#B4B9C9] pt-4'>
          <h2 className='text-2xl text-[#344054] font-medium mb-4'>Your Languages</h2>
          <div className='space-y-3 w-full bg-white px-8 py-4 rounded-xl'>
            {languages.map((language) => (
              <div
                key={language.id}
                className='grid grid-cols-2 items-center gap-4 border-b border-gray-200 last:border-none py-3'
              >
                <div className='font-medium'>
                  {language.name}{' '}
                  {language.name === 'English' && <span className='text-xs text-gray-500'>(default)</span>}
                </div>
                <div className='flex items-center gap-2 relative'>
                  <div className='w-full' ref={isLevelDropdownOpen === language.id ? dropdownRef : null}>
                    <button
                      type='button'
                      className='border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between w-full text-left'
                      onClick={() => setIsLevelDropdownOpen(language.id)}
                      disabled={language.name === 'English'}
                    >
                      <span>{language.level}</span> <ChevronDown size={16} />
                    </button>
                    {isLevelDropdownOpen === language.id && (
                      <div className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg'>
                        {languageLevels.map((level) => (
                          <button
                            key={level}
                            className='w-full text-left px-4 py-3 hover:bg-gray-100 flex flex-col'
                            onClick={() => updateLanguageLevel(language.id, level)}
                          >
                            <span className='font-medium'>{level}</span>
                            <span className='text-sm text-gray-500'>{levelDescriptions[level]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeLanguage(language.id)}
                    disabled={language.name === 'English'}
                  >
                    <Trash className='text-gray-500' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {languages.length < languageOptions.length && (
            <div className='relative mt-4' ref={isLanguageDropdownOpen ? dropdownRef : null}>
              <Button
                type='button'
                variant='outline'
                className='rounded-full bg-transparent'
                onClick={() => setIsLanguageDropdownOpen(true)}
              >
                <Plus className='mr-2 h-4 w-4' /> Add a language
              </Button>
              {isLanguageDropdownOpen && (
                <div className='absolute z-10 mt-2 w-72 bg-white border border-gray-300 rounded shadow-lg'>
                  <div className='p-2 border-b'>
                    <div className='relative'>
                      <input
                        type='text'
                        placeholder='Search...'
                        className='w-full border border-gray-300 rounded pl-9 pr-3 py-2'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    </div>
                  </div>
                  <div className='max-h-64 overflow-y-auto'>
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((language) => (
                        <button
                          key={language}
                          className='w-full text-left px-4 py-2.5 hover:bg-gray-100'
                          onClick={() => addLanguage(language)}
                        >
                          {language}
                        </button>
                      ))
                    ) : (
                      <p className='p-4 text-gray-500 text-center'>No languages found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer className='px-4 mt-auto flex justify-between'>
        <div>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>
        <div className='space-x-4'>
          <Button onClick={nextStep} className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'>
            Next, Write Bio
          </Button>
        </div>
      </Footer>
    </div>
  )
}

export default UserAddLanguagesActiveState

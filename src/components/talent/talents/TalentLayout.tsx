import React from 'react'

interface TalentLayoutProps {
  children: React.ReactNode
  padding?: string  
  borderRadius?: string 
}

const TalentLayout = ({
  children,
  padding = "p-8",       
  borderRadius = "rounded-none", 
}: Readonly<TalentLayoutProps>) => {
  return (
    <section className="px-6 py-6">
      <div className={`bg-white ${borderRadius} ${padding} max-w-2xl mx-auto`}>
        {children}
      </div>
    </section>
  )
}

export default TalentLayout

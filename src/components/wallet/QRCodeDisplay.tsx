import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  value: string
  size?: number
  coinId?: string
  showLogo?: boolean
}

function QRCodeDisplay({ 
  value, 
  size = 200, 
  coinId = 'usdt', 
  showLogo = true 
}: QRCodeDisplayProps) {
  const logoSize = Math.floor(size * 0.2) 

  return (
    <div className='flex justify-center items-center p-4'>
      <div className='relative bg-white p-4 rounded-lg shadow-sm'>
        <QRCodeSVG
          value={value}
          size={size}
          bgColor='#ffffff'
          fgColor='#000000'
          level='H' // High error correction to allow for logo overlay
        //   includeMargin={false}
          marginSize={0}
        />
        
        {/* Logo Overlay */}
        {showLogo && (
          <div 
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm'
            style={{
              width: logoSize + 8,
              height: logoSize + 8,
            }}
          >
            <div className='flex items-center justify-center w-full h-full'>
              {getCryptoIcon(coinId, logoSize)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRCodeDisplay





export const USDTIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
<rect x='0.277344' y='0.671875' width='19.4458' height='19.4458' fill='url(#pattern0_10_14414)'/>
<defs>
<pattern id='pattern0_10_14414' patternContentUnits='objectBoundingBox' width='1' height='1'>
<use xlinkHref='#image0_10_14414' transform='scale(0.0104167)'/>
</pattern>
<image id='image0_10_14414' width='96' height='96' preserveAspectRatio='none' xlinkHref='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABLUExURUdwTP////////////////////////////////r9/P///////////////yahe5TRvuTz71u4m3bEq0Gsi7Pe0cvo30GtizOng4XKtfzWBtIAAAANdFJOUwBDr78kcBDfX/aQoM8BtzkgAAADuklEQVRo3rWa27arIAxFvSMqRihe/v9LDz0dbaMChtSdx9au2ZAQMJBlJGvyuisGIZUzKcqiq/Mmu8uathfKY0PfVjeo16WKWPkjI4+qv6zI+X9eKJKJlqVfS0U2BiIXKskSEVWhkq1PCHcrFcPITjSdYlpHmnyVUGwThGGqpFJ/SWjVj3YRiFr9bPUf60cJrbrFgqNUfZ+ZGPb9dXWZn9PIsPnzc+klNCj/DQegUbb6ZhyavywHxhENUhcPsOEBTCzQuEAwHRhHVAROYeh/d2AcAa+k4QFiOzCuuI7tl2pcQYEN2LkgQg7IZbzHhTrggEXPP0i2+l2Qjb8GIQcsrfbApQsBBxgAfxTygAMcwKI8iVQEHOAAUMlzO9dTld47wAJo/E1zCvHOARZg58IrzHgHrX8H6OMY4RGax98BOxeaeJ3mAfShavfhMqcNNpTi2+4LHVw7Ve8AA7VO60CuxRYeN9cacp0mA/Da2eBpbO4CbHgy1+SFhg5AJa9GmwlzGwCVvO5biKbYr9aH1iiLjNZ4FYi4UHznsX+lfJjN2tlaC4DTFOD56QybXuIuDN+14Pyk3pzIZh7hIdKvR5awCyKT3jLnHoHZmpUSg8XYySwBF2QWcGCTdqUHeZmnQ4qs70czvwPGk7SxLHJDEqhjmT/E1rN7iQH0SQEOgMP3y6QmWKiAFeQxyz9p9AnykfB0cd40CsTqkvNlOPirBlc9Jax+fYm2LAcfF/O/7M7WJbt+eGaINhvYZ12T87aGZrLA1fo01dy/s/P3tW1+G3ohm+zOy9PmqNztWfyTeXn+U6cq8Tuim9zg5uB6vYvvFHVjrUN7g4i+K3a1ohKIADi8leeKSqAB9vpuwWkUlUACHPSf+xZBJVAAR/3h8PoXJRAAcGrkeTsgwAWAty/SKCLhEnDWf7VFSiLhCuDRL4NdKEgHQLBz1CgaIQ7w6b8bRyWNEAV49QvfS2CYEAN49b/dBEEiRAB+fXHVbAQqAK6ag41MfPnSFH1B6JcCBQCU7qYgEAKAkL7YH3gQXvD8ACC2Z4trghcQ1O/JXX0gr7/xPn+rGARI6V936YSwfnfRWqYRwvre1nLscAUS9avL9j6BENZXFeOAAhL0W9YRC5D1uYc4cIc+dZR443N5EAjX+rL66agRuPlJPiyFi/lLvanQigghqC8TzqyrPkgI6hdp9xPa1CP39LsJKQhZs+4lUBGiZl9DyQmXB0r2xY1XuNv41ZP6hjs0VdsP3pHp2xtv6Dyv/5Tv6z9DwvWff0u1gzxxIn/4AAAAAElFTkSuQmCC'/>
</defs>
</svg>

)

const USDCIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox='0 0 32 32' fill='none'>
    <circle cx='16' cy='16' r='16' fill='#2775CA'/>
    <path 
      d='M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm6.5-12.846c0-2.523-1.576-3.948-5.263-4.836v-4.44c1.14.234 2.231.858 3.158 1.871l2.105-2.455c-1.404-1.56-3.25-2.523-5.263-2.757V4.462h-2.104v2.104c-3.341.312-5.68 2.182-5.68 5.055 0 2.523 1.576 3.948 5.263 4.836v4.44c-1.14-.234-2.231-.858-3.158-1.871l-2.105 2.455c1.404 1.56 3.25 2.523 5.263 2.757v2.075h2.104v-2.104c3.341-.312 5.68-2.182 5.68-5.055z' 
      fill='white'
    />
  </svg>
)

const getCryptoIcon = (coinId: string, size?: number) => {
  switch (coinId.toLowerCase()) {
    case 'usdt':
      return <USDTIcon size={size} />
    case 'usdc':
      return <USDCIcon size={size} />
    default:
      return null
  }
}

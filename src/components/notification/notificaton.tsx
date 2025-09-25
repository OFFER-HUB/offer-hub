import { notifications } from '@/data/mock-data-notifications'



export default function Notification() {

  return (
    <div className=' w-full p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Notifications</h1>

      <div className='space-y-4'>
        {notifications.map((notification) => {
          const IconComponent = notification.icon
          return (
            <div
              key={notification.id}
              className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex items-start space-x-4'>
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center`}
                >
                  <IconComponent className={`w-5 h-5 ${notification.iconColor}`} />
                </div>

                <div className='flex-1 min-w-0'>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>{notification.title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed mb-3'>{notification.description}</p>
                  <p className='text-gray-400 text-sm'>{notification.timestamp}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom navigation bar */}
      <div className='fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4'>
        <div className='flex justify-center space-x-8'>
          <button className='flex flex-col items-center space-y-1'>
            <div className='w-6 h-6 bg-blue-500 rounded'></div>
            <span className='text-xs'>Ask to edit</span>
          </button>
        </div>
      </div>
    </div>
  )
}

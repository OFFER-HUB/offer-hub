import { MdEmail, MdPhone, MdChat } from 'react-icons/md';

const supportOptions = [
  {
    icon: <MdEmail className='text-teal-600 text-3xl' />,
    title: 'Email Support',
    description: 'Get help via email with a response time of 24–48 hours.',
    buttonLabel: 'Email Us',
    buttonStyle: 'bg-teal-600 text-white hover:bg-teal-700',
    href: '#',
  },
  {
    icon: <MdChat className='text-teal-600 text-3xl' />,
    title: 'Live Chat',
    description: 'Chat with our support team during business hours.',
    buttonLabel: 'Start Chat',
    buttonStyle: 'border border-teal-600 text-teal-600 hover:bg-teal-50',
    href: '#',
  },
  {
    icon: <MdPhone className='text-teal-600 text-3xl' />,
    title: 'Phone Support',
    description: 'Call us directly for urgent matters and premium support.',
    buttonLabel: 'Call Support',
    buttonStyle: 'border border-teal-600 text-teal-600 hover:bg-teal-50',
    href: '#',
  },
];

export default function ContactSupport() {
  return (
    <section className='bg-gray-50 py-16 px-4'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-2xl font-bold mb-2'>Contact Support</h2>
        <p className='text-gray-600 mb-10'>
          Can’t find what you’re looking for? Our support team is here to help.
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left'>
          {supportOptions.map((option, idx) => (
            <div
              key={idx}
              className='bg-white border rounded-lg p-6 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='bg-teal-50 p-3 rounded-full mb-4'>
                {option.icon}
              </div>
              <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                {option.title}
              </h3>
              <p className='text-sm text-gray-600 mb-4'>{option.description}</p>
              <a
                href={option.href}
                className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${option.buttonStyle}`}
              >
                {option.buttonLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

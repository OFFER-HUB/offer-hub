import { steps } from '@/data/landing-data';

export default function HowItWorksSection() {
  return (
    <section className='py-16 bg-[#002333] text-white'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl font-bold mb-4'>How Offer Hub Works</h2>
          <p className='max-w-2xl mx-auto opacity-80'>
            Simple steps to find the perfect freelancer or get hired for your
            skills
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {steps.map((step, index) => (
            <div key={index} className='text-center'>
              <div className='w-16 h-16 rounded-full bg-[#15949C] flex items-center justify-center mx-auto mb-6'>
                <span className='text-2xl font-bold'>{index + 1}</span>
              </div>
              <h3 className='text-xl font-semibold mb-3'>{step.title}</h3>
              <p className='opacity-80'>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProfileDetails() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="block text-xs font-medium text-gray-600"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value="Carlos Rodriguez"
              readOnly
              className="w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value="carlos.rodriguez@example.com"
              readOnly
              className="w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-gray-600"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value="+34 612 345 678"
              readOnly
              className="w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="location"
              className="block text-xs font-medium text-gray-600"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value="Madrid, Spain"
              readOnly
              className="w-full h-9 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4 space-y-1.5">
          <label
            htmlFor="bio"
            className="block text-xs font-medium text-gray-600"
          >
            Bio
          </label>
          <textarea
            id="bio"
            readOnly
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 resize-none min-h-[60px] focus:outline-none"
            value="Entrepreneur and business owner looking for talented freelancers to help with various digital projects."
          ></textarea>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600">
            Skills
          </label>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-green-100 text-black border border-green-200">
              Project Management
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-green-100 text-black border border-green-200">
              Marketing
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-green-100 text-black border border-green-200">
              Business Strategy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

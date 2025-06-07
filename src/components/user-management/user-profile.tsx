import React from "react";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
interface UserProfileProps {
  onBack: () => void;
  onMessage: () => void;
  onRestrictAccount: () => void;
}

const UserProfile = ({
  //   onBack,
  onMessage,
  onRestrictAccount,
}: UserProfileProps) => {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8 max-w-4xl mx-auto">
      <div className="">
        {/* Header Section */}
        <div className="border border-[#DEEFE7] bg-[#F8F8F8] shadow-sm">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  John D
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                  UI/UX designer | Brand designer | Figma pro
                </p>
                <p className="text-sm text-gray-500 mb-4">Canada</p>
              </div>
            </div>
            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                UI/UX
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Design
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Figma
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Product design
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Framer
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              I am a UI/UX designer with 4 years of experience in creating
              user-friendly interfaces and enhancing user experiences. My
              passion lies in understanding user needs and translating them into
              intuitive designs that drive engagement and satisfaction.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="flex items-center justify-center p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <Heart size={20} />
              </button>
              <button
                onClick={onMessage}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <MessageCircle size={18} />
                Message
              </button>
              <button
                onClick={onRestrictAccount}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Restrict Account
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="border border-[#DEEFE7] mt-4 bg-[#F8F8F8] shadow-sm">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Portfolio Item 1 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-12 h-16 bg-blue-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mobile app design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 2 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-20 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mobile app design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 3 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-20 h-12 bg-purple-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Website design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 4 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-400 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Landing page design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 5 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-20 h-14 bg-orange-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Dashboard design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>

              {/* Portfolio Item 6 */}
              <div className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg p-4 mb-3 aspect-square flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-500 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Dashboard design
                </h3>
                <p className="text-sm text-gray-500">August 2024</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft size={16} />
                Back
              </button>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 md:p-8 border border-[#DEEFE7] mt-4 bg-[#F8F8F8] shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          <div className="space-y-6 mb-6">
            {/* Review 1 */}
            <div className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">John Doe</h3>
                  <p className="text-sm text-gray-500">April 15, 2025</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <Star
                    size={16}
                    className="fill-yellow-400 text-yellow-400 opacity-50"
                  />
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                &quot;Very helpful, and insightful. We look forward to a long
                lasting relationship with Mohsin and his team of lead generation
                experts.&quot;
              </p>
            </div>

            {/* Review 2 */}
            <div className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Alex Smith</h3>
                  <p className="text-sm text-gray-500">April 15, 2025</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <Star
                    size={16}
                    className="fill-yellow-400 text-yellow-400 opacity-50"
                  />
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                &quot;Incredibly useful and enlightening. We are excited about
                building a lasting partnership with Sarah and her team of
                marketing specialists.&quot;
              </p>
            </div>

            {/* Review 3 */}
            <div className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Emily Johnson</h3>
                  <p className="text-sm text-gray-500">April 15, 2025</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <Star
                    size={16}
                    className="fill-yellow-400 text-yellow-400 opacity-50"
                  />
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                &quot;Incredibly useful and enlightening. We are excited about
                building a lasting partnership with Sarah and her team of
                marketing specialists.&quot;
              </p>
            </div>
          </div>

          {/* Reviews Navigation */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

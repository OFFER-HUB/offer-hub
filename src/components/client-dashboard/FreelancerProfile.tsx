import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-12">
      {/* Profile Header Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src="/placeholder.svg?height=80&width=80"
              alt="John D"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-500">John D</p>
            <h1 className="text-2xl font-bold">
              UI/UX designer | Brand designer |
            </h1>
            <p className="text-lg font-medium">Figma pro</p>
            <p className="text-sm text-gray-500">Canada</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          I am a UI/UX designer with 4 years of experience in creating
          user-friendly intHello! I came across your job posting for a market
          survey freelancer in Kaduna, and I believe I would be a great fit for
          this role. With my extensive experience in market research and a solid
          grasp of local market dynamics, I am confident in my ability to gather
          and analyze data effectively. I am detail-oriented and committed to
          providing actionable insights that can help your business thrive. I
          would love the opportunity to discuss how I can contribute to your
          project interfaces and enhancing user experiences. My passion lies in
          understanding user needs and translating them into intuitive designs
          that drive engagement and satisfaction.
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 bg-transparent"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 max-w-[200px] py-2 px-4 rounded-full bg-transparent"
          >
            Message
          </Button>
          <Button className="flex-1 max-w-[200px] py-2 px-4 rounded-full bg-gray-900 text-white hover:bg-gray-800">
            Hire
          </Button>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Portfolio</h2>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Mobile app design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Mobile app design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Mobile app design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Mobile app design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Website design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Website design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Landing page design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Landing page design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Dashboard design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Dashboard design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
            <div className="flex-shrink-0 w-[200px] text-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Dashboard design"
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
              <p className="font-semibold text-sm">Dashboard design</p>
              <p className="text-xs text-gray-500">August 2024</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="ghost" className="text-gray-500">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-900 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
          <Button variant="ghost" className="text-gray-500">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Reviews</h2>
        <div className="space-y-6">
          {/* Review 1 */}
          <div>
            <h3 className="font-semibold text-lg">John Doe</h3>
            <p className="text-sm text-gray-500 mb-2">March 20, 2024</p>
            <div className="flex items-center gap-0.5 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-gray-700">
              &quot;Very helpful, and insightful. We look forward to a long
              lasting relationship with Mohsin and his team of lead generation
              experts.&quot;
            </p>
          </div>

          {/* Review 2 */}
          <div>
            <h3 className="font-semibold text-lg">Alex Smith</h3>
            <p className="text-sm text-gray-500 mb-2">April 15, 2025</p>
            <div className="flex items-center gap-0.5 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 text-gray-300" /> {/* One empty star */}
            </div>
            <p className="text-gray-700">
              &quot;Incredibly useful and enlightening. We are excited about
              building a lasting partnership with Sarah and her team of
              marketing specialists.&quot;
            </p>
          </div>

          {/* Review 3 */}
          <div>
            <h3 className="font-semibold text-lg">Emily Johnson</h3>
            <p className="text-sm text-gray-500 mb-2">April 15, 2025</p>
            <div className="flex items-center gap-0.5 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 text-gray-300" /> {/* One empty star */}
            </div>
            <p className="text-gray-700">
              &quot;Incredibly useful and enlightening. We are excited about
              building a lasting partnership with Sarah and her team of
              marketing specialists.&quot;
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <Button variant="ghost" className="text-gray-500">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-900 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
          <Button variant="ghost" className="text-gray-500">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}

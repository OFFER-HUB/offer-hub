"use client";

import { useRouter } from "next/navigation";
import { Award, CheckCircle, Clock, MapPin, Send, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FreelancerProfile } from "@/lib/mockData/freelancer-profile-mock";

interface ProfileHeaderProps {
  freelancer: FreelancerProfile;
}

export default function ProfileHeader({ freelancer }: ProfileHeaderProps) {
  const router = useRouter();
  
  const handleSendOffer = () => {
    router.push(`/talent/${freelancer.id}/send-offer`);
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback className="text-lg font-semibold">
                {freelancer.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {freelancer.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{freelancer.name}</h1>
              {freelancer.isTopRated && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3 mr-1" />
                  Top Rated
                </Badge>
              )}
            </div>
            
            <p className="text-lg text-gray-700 mb-2">{freelancer.title}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {freelancer.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {freelancer.lastActive}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(freelancer.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {freelancer.rating} ({freelancer.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex flex-col gap-4 md:ml-auto">
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold text-gray-900">
              ${freelancer.hourlyRate}/hr
            </div>
            <div className="text-sm text-gray-600">
              ${freelancer.totalEarned.toLocaleString()} total earned
            </div>
            <div className="text-sm text-gray-600">
              {freelancer.completionRate}% completion rate
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSendOffer}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Offer
            </Button>
            <Button variant="outline" className="w-full">
              Contact
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bio */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-gray-700 leading-relaxed">{freelancer.bio}</p>
      </div>
    </div>
  );
}

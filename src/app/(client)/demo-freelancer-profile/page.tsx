"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, DollarSign } from "lucide-react";
import { mockFreelancerProfiles } from "@/lib/mockData/freelancer-profile-mock";
import Link from "next/link";
import TalentLayout from "@/components/talent/TalentLayout";

export default function DemoFreelancerProfilePage() {
  // Removed unused state variables to fix linting warnings

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <TalentLayout>
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Freelancer Profile Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the freelancer profile and portfolio pages. Click on any freelancer to view their detailed profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFreelancerProfiles.map((freelancer) => (
            <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                    <AvatarFallback className="text-lg font-semibold">
                      {freelancer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{freelancer.name}</CardTitle>
                <p className="text-gray-600">{freelancer.title}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-1">
                  {renderStars(freelancer.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    {freelancer.rating} ({freelancer.reviewCount} reviews)
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {freelancer.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${freelancer.hourlyRate}/hr
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Link href={`/talent/${freelancer.id}/profile`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/talent/${freelancer.id}/portfolio`}>
                    <Button size="sm">
                      View Portfolio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

       
      </div>
    </TalentLayout>
  );
}

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket,
  Briefcase,
  HandshakeIcon,
  CreditCard,
  Search,
} from "lucide-react";

interface Question {
  question: string;
  href: string;
}

interface Category {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: Question[];
}

const categories: Category[] = [
  {
    title: "Getting Started",
    icon: Rocket,
    questions: [
      {
        question: "How do I sign up for the platform?",
        href: "#",
      },
      {
        question: "How can I recover my password?",
        href: "#",
      },
      {
        question: "Can I use my social media account to log in?",
        href: "#",
      },
    ],
  },
  {
    title: "Offering Services",
    icon: Briefcase,
    questions: [
      {
        question: "How do I list a service?",
        href: "#",
      },
      {
        question: "What are the requirements for my profile?",
        href: "#",
      },
      {
        question:
          "How can I make my service stand out to attract more clients?",
        href: "#",
      },
    ],
  },
  {
    title: "Hiring Services",
    icon: HandshakeIcon,
    questions: [
      {
        question: "How do I hire a professional?",
        href: "#",
      },
      {
        question: "What steps should I follow to post a job offer?",
        href: "#",
      },
      {
        question: "How can I rate the professional after completing a project?",
        href: "#",
      },
    ],
  },
  {
    title: "Payments and Billing",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        href: "#",
      },
      {
        question: "How do I withdraw my earnings in cryptocurrency?",
        href: "#",
      },
      {
        question: "Can I use a specific wallet to receive payments?",
        href: "#",
      },
    ],
  },
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="container max-w-4xl py-6 md:py-12 space-y-8 text-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Help Center
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full pl-9"
              placeholder="Search for help..."
              type="search"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {categories.map((category) => (
            <Card key={category.title} className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {category.questions.map((item) => (
                  <a
                    key={item.question}
                    href={item.href}
                    className="text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {item.question}
                  </a>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

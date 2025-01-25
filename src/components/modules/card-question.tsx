interface CardQuestionProps {
  question: string;
  href: string;
}

export function CardQuestion({ question, href }: CardQuestionProps) {
  return (
    <a
      href={href}
      className="text-teal-600 hover:text-teal-700 hover:underline"
    >
      {question}
    </a>
  );
}

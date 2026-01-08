import { Badge } from "@/components/ui/badge";

interface LanguageBadgesProps {
  languages: string[];
}

const LanguageBadges = ({ languages }: LanguageBadgesProps) => {
  if (!languages || languages.length === 0) {
    return <span className="profile-field-empty">No languages added</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang, index) => (
        <Badge key={index} variant="language">
          {lang}
        </Badge>
      ))}
    </div>
  );
};

export default LanguageBadges;

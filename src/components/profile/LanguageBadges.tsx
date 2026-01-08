interface LanguageBadgesProps {
  languages: string[];
}

const LanguageBadges = ({ languages }: LanguageBadgesProps) => {
  if (!languages || languages.length === 0) {
    return <span className="profile-field-empty">No languages added</span>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {languages.map((lang, index) => (
        <span 
          key={index} 
          className="language-badge"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {lang}
        </span>
      ))}
    </div>
  );
};

export default LanguageBadges;

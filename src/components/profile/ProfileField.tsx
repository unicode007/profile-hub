interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
  placeholder?: string;
}

const ProfileField = ({ label, value, placeholder = "Not provided" }: ProfileFieldProps) => {
  const displayValue = value !== null && value !== undefined && value !== "" 
    ? value 
    : placeholder;
  
  const isEmpty = !value || value === "";

  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className={`profile-field-value ${isEmpty ? 'profile-field-empty' : ''}`}>
        {displayValue}
      </span>
    </div>
  );
};

export default ProfileField;

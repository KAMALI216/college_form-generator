/**
 * Calculates the profile completion percentage.
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const requiredFields = [
    profile.registerNumber,
    profile.department,
    profile.semester,
    profile.academicYear,
    profile.phone,
    profile.dob,
    profile.gender,
    profile.parentName,
    profile.address
  ];

  const totalRequired = requiredFields.length;
  const completedRequired = requiredFields.filter(val => val !== null && val !== undefined && String(val).trim() !== '').length;

  return Math.round((completedRequired / totalRequired) * 100);
};

export const getMissingProfileFields = (profile) => {
  if (!profile) return ['All fields'];

  const missing = [];
  
  if (!profile.registerNumber) missing.push('Register Number');
  if (!profile.department) missing.push('Department');
  if (!profile.semester) missing.push('Semester');
  if (!profile.academicYear) missing.push('Academic Year');
  if (!profile.phone) missing.push('Phone Number');
  if (!profile.dob) missing.push('Date of Birth');
  if (!profile.gender) missing.push('Gender');
  if (!profile.parentName) missing.push('Parent Name');
  if (!profile.address) missing.push('Address');

  return missing;
};

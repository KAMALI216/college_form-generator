/**
 * Calculates the profile completion percentage.
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const requiredFields = [
    profile.personal?.fullName,
    profile.personal?.dateOfBirth,
    profile.personal?.gender,
    profile.contact?.email,
    profile.contact?.phone,
    profile.address?.address,
    profile.address?.city,
    profile.address?.state,
    profile.address?.pincode,
  ];

  const totalRequired = requiredFields.length;
  const completedRequired = requiredFields.filter(val => val && String(val).trim() !== '').length;

  // Additional weight for arrays/objects
  let bonusPoints = 0;
  if (profile.education && profile.education.length > 0) bonusPoints += 1;
  if (profile.resume?.fileName) bonusPoints += 1;
  
  const totalWeight = totalRequired + 2; // Required + 2 bonus components
  const completedWeight = completedRequired + bonusPoints;

  return Math.round((completedWeight / totalWeight) * 100);
};

export const getMissingProfileFields = (profile) => {
  if (!profile) return ['All fields'];

  const missing = [];
  
  if (!profile.personal?.fullName) missing.push('Full Name');
  if (!profile.personal?.dateOfBirth) missing.push('Date of Birth');
  if (!profile.personal?.gender) missing.push('Gender');
  if (!profile.contact?.email) missing.push('Email');
  if (!profile.contact?.phone) missing.push('Phone Number');
  if (!profile.address?.address) missing.push('Address Line 1');
  if (!profile.address?.city) missing.push('City');
  if (!profile.address?.state) missing.push('State');
  if (!profile.address?.pincode) missing.push('PIN Code');
  if (!profile.resume?.fileName) missing.push('Resume Upload');
  if (!profile.education || profile.education.length === 0) missing.push('Education Details');

  return missing;
};

/**
 * Normalizes a field label for mapping comparison.
 * Lowercases, trims, and removes punctuation.
 */
const normalizeLabel = (label) => {
  if (!label) return '';
  return label.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
};

/**
 * Maps common form labels to profile data paths.
 * Returns the resolved value from the profile, or undefined if no match.
 */
export const getMappedProfileValue = (fieldLabel, profile) => {
  if (!profile || !fieldLabel) return undefined;

  const normalized = normalizeLabel(fieldLabel);

  // Exact matching or common synonyms
  if (['full name', 'name of applicant', 'applicant name', 'name', 'student name'].includes(normalized)) {
    return profile.personal?.fullName;
  }
  
  if (['email', 'email address', 'contact email'].includes(normalized)) {
    return profile.contact?.email;
  }
  
  if (['mobile number', 'phone number', 'contact number', 'phone', 'mobile'].includes(normalized)) {
    return profile.contact?.phone;
  }
  
  if (['date of birth', 'dob'].includes(normalized)) {
    return profile.personal?.dateOfBirth;
  }
  
  if (['gender', 'sex'].includes(normalized)) {
    return profile.personal?.gender;
  }
  
  if (['address', 'permanent address', 'residential address'].includes(normalized)) {
    return profile.address?.address;
  }
  
  if (['city', 'district'].includes(normalized)) {
    return profile.address?.city;
  }
  
  if (['state'].includes(normalized)) {
    return profile.address?.state;
  }
  
  if (['pin code', 'pincode', 'zip code', 'zip', 'postal code'].includes(normalized)) {
    return profile.address?.pincode;
  }
  
  if (['country'].includes(normalized)) {
    return profile.address?.country;
  }

  // Educational fields (defaults to latest/first education record)
  const latestEdu = profile.education && profile.education.length > 0 ? profile.education[0] : null;
  
  if (latestEdu) {
    if (['college name', 'university', 'institution name', 'college'].includes(normalized)) {
      return latestEdu.institution;
    }
    if (['cgpa', 'grade', 'percentage'].includes(normalized)) {
      return latestEdu.cgpa || latestEdu.percentage;
    }
    if (['degree', 'course'].includes(normalized)) {
      return latestEdu.degree;
    }
    if (['branch', 'department'].includes(normalized)) {
      return latestEdu.branch;
    }
  }

  // Return undefined if no match is found
  return undefined;
};

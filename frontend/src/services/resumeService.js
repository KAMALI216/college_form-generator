const API_URL =
  import.meta.env.VITE_RESUME_API_URL ||
  'http://127.0.0.1:8001';


export const extractResumeInformation = async (file) => {

  try {

    // ==========================================
    // STEP 1: Upload Resume PDF
    // ==========================================

    const formData = new FormData();

    formData.append('file', file);

    console.log('Uploading resume:', file.name);

    const textResponse = await fetch(
      `${API_URL}/extract-text`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!textResponse.ok) {

      const errorText = await textResponse.text();

      console.error(
        'Text extraction error:',
        errorText
      );

      throw new Error(
        `Failed to extract text: ${textResponse.status}`
      );
    }


    // ==========================================
    // STEP 2: Get extracted text
    // ==========================================

    const textData = await textResponse.json();

    console.log(
      'PDF extraction response:',
      textData
    );

    const resumeText = textData.text;

    if (
      !resumeText ||
      resumeText.trim().length === 0
    ) {

      throw new Error(
        'No text could be extracted from the uploaded file.'
      );
    }

    console.log(
      'Extracted text length:',
      resumeText.length
    );


    // ==========================================
    // STEP 3: Send text to Qwen
    // ==========================================

    const profileResponse = await fetch(
      `${API_URL}/extract-profile`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        // IMPORTANT:
        // Backend expects "extractedText"
        body: JSON.stringify({
          extractedText: resumeText,
        }),
      }
    );


    // ==========================================
    // STEP 4: Handle backend errors
    // ==========================================

    if (!profileResponse.ok) {

      const errorText =
        await profileResponse.text();

      console.error(
        'Profile extraction backend error:',
        errorText
      );

      throw new Error(
        `Failed to extract profile: ${profileResponse.status} ${errorText}`
      );
    }


    // ==========================================
    // STEP 5: Read profile JSON
    // ==========================================

    const profileData =
      await profileResponse.json();

    console.log(
      'Profile extraction response:',
      profileData
    );


    if (profileData.error) {

      throw new Error(
        profileData.error
      );
    }


    return profileData.profile;

  } catch (error) {

    console.error(
      'Error extracting resume information:',
      error
    );

    throw error;
  }
};
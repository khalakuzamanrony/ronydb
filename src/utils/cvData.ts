import { CVData } from '../types/cv';
import { supabase } from './supabaseClient';
import { encryptData, decryptData } from './encryption';

export const defaultCVData: CVData = {
  "basics": {
    "name": "Khalekuzzaman Rony",
    "label": "SQA Engineer",
    "image": "https://iamrony.netlify.app/assets/img/Single.webp",
    "summary": "Passionate SQA Engineer with 1.2 years of experience in manual and automated testing. Skilled in full testing lifecycle, defect management, and cross-functional collaboration. Proven track record of ensuring product quality in agile environments.",
    "customFields": []
  },
  "contacts": {
    "email": "khalekuzzamanrony3@gmail.com",
    "phone": "+880 1792992245",
    "url": "https://iamrony.netlify.app",
    "location": {
      "city": "Dinajpur",
      "country": "Bangladesh"
    },
    "profiles": [
      {
        "network": "LinkedIn",
        "username": "khalekuzzamanrony",
        "url": "https://www.linkedin.com/in/khalekuzzamanrony"
      },
      {
        "network": "GitHub",
        "username": "khalakuzamanrony",
        "url": "https://github.com/khalakuzamanrony/"
      }
    ],
    "customFields": []
  },
  "work": [
    {
      "name": "Friends Corp.",
      "location": "Tokyo, Japan (Remote)",
      "url": "https://teamfriends.co.jp/",
      "position": "SQA Engineer",
      "jobType": "Full-time",
      "employeeType": "Remote",
      "startDate": "2025-04",
      "highlights": [
        "Achieved 100% production readiness for 5 products (3 new, 2 legacy) within 4 months",
        "Executed end-to-end UI and functional validation across 5+ products",
        "Managed 1500+ defects through Jira with detailed reproducibility steps",
        "Conducted multilingual QA (English/Japanese) for locale-specific functionality"
      ],
      "customFields": []
    },
    {
      "name": "Friends Corp.",
      "location": "New York, USA (Remote)",
      "url": "https://afnanilab.com/",
      "position": "Junior SQA Engineer",
      "jobType": "Full-time",
      "employeeType": "Remote",
      "startDate": "2024-06",
      "endDate": "2025-04",
      "highlights": [
        "Promoted to junior role in 3 months by improving test coverage by 60%",
        "Created and executed test cases for multiple modules, tracked in Google Sheets",
        "Documented and tracked 3000+ issues in Basecamp with clear reproduction steps"
      ],
      "customFields": []
    }
  ],
  "education": [
    {
      "institution": "University of Rajshahi",
      "area": "Information & Communication Engineering (ICE)",
      "studyType": "Bachelor",
      "startDate": "2018",
      "endDate": "2023",
      "score": "CGPA: 3.27/4.00",
      "cgpa": "3.27",
      "scale": "4.00",
      "customFields": []
    },
    {
      "institution": "Bogra Cantonment Public School & College",
      "area": "Science",
      "studyType": "Higher Secondary Certificate",
      "startDate": "2015",
      "endDate": "2017",
      "score": "GPA: 5.00/5.00",
      "cgpa": "5.00",
      "scale": "5.00",
      "customFields": []
    }
  ],
  "skills": {
    "technical": [
      {
        "name": "Testing Methods",
        "keywords": [
          "Manual testing",
          "Regression testing",
          "UI testing",
          "Functional testing",
          "System testing"
        ]
      },
      {
        "name": "Programming",
        "keywords": ["JavaScript", "Java", "HTML/CSS"]
      },
      {
        "name": "Tools",
        "keywords": ["Playwright", "Selenium", "Jira", "Postman", "VS Code"]
      }
    ],
    "methodologies": ["SDLC", "STLC", "Agile"],
    "customFields": []
  },
  "projects": [],
  "certificates": [
    {
      "name": "Software Testing",
      "date": "2024",
      "issuer": "Great Learning Academy",
      "url": "https://drive.google.com/file/d/1MQvMpuC4u7HmgcMKPYjf03hv3j9wBXr_/view",
      "customFields": []
    },
    {
      "name": "MySQL",
      "date": "2024",
      "issuer": "Great Learning Academy",
      "url": "https://www.testdome.com/certificates/f8560502715e4a359b8cac89b1c3310a",
      "customFields": []
    }
  ],
  "languages": [
    {
      "language": "English",
      "fluency": "Professional",
      "customFields": []
    },
    {
      "language": "Japanese",
      "fluency": "Basic (QA Proficiency)",
      "customFields": []
    },
    {
      "language": "Bengali",
      "fluency": "Native",
      "customFields": []
    }
  ],
  "coverLetters": [
    {
      "id": "1",
      "title": "Default Cover Letter",
      "content": "Dear Hiring Manager,\n\nI am excited to apply for the SQA Engineer position at your company. With 1.2 years of experience in manual and automated testing, I have developed a comprehensive skill set that includes end-to-end testing, defect management, and cross-functional collaboration.\n\nIn my current role at Friends Corp., I have successfully ensured production readiness for 5 products and managed over 1500 defects through Jira. My experience includes multilingual QA testing and working in agile environments, which has prepared me to contribute effectively to your team.\n\nI am passionate about quality assurance and committed to delivering exceptional results. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your organization's success.\n\nThank you for considering my application.\n\nBest regards,\nKhalekuzzaman Rony"
    }
  ],
  "customTabs": [],
  "tabOrder": ["basics", "contacts", "work", "education", "skills", "certificates", "languages", "coverLetters"],
  "assets": {
    "images": {},
    "pdfs": {}
  },
  "tools": []
};

// Fetch CV data from Supabase
export const fetchCVDataFromSupabase = async (): Promise<CVData | null> => {
  try {
    const { data, error } = await supabase.from('cv_data').select('data').eq('id', 'main').single();
    if (error) {
      console.error('Error fetching CV data from Supabase:', error);
      return null;
    }
    
    if (!data?.data) return defaultCVData;
    
    // Decrypt the data if it's a string (encrypted)
    let decryptedData;
    if (typeof data.data === 'string') {
      decryptedData = decryptData(data.data);
      if (!decryptedData) {
        console.error('Failed to decrypt data');
        return defaultCVData;
      }
    } else {
      // Handle case where data might not be encrypted yet during transition
      decryptedData = data.data;
    }
    
    // Merge with defaultCVData to ensure all fields exist
    return {
      ...defaultCVData,
      ...decryptedData,
      customTabs: decryptedData.customTabs || defaultCVData.customTabs,
      tabOrder: decryptedData.tabOrder || defaultCVData.tabOrder,
      assets: decryptedData.assets || defaultCVData.assets,
      coverLetters: decryptedData.coverLetters || defaultCVData.coverLetters,
      tools: decryptedData.tools || defaultCVData.tools,
      basics: { ...defaultCVData.basics, ...(decryptedData.basics || {}) },
      contacts: { ...defaultCVData.contacts, ...(decryptedData.contacts || {}) },
      work: decryptedData.work || defaultCVData.work,
      education: decryptedData.education || defaultCVData.education,
      skills: { ...defaultCVData.skills, ...(decryptedData.skills || {}) },
      projects: decryptedData.projects || defaultCVData.projects,
      certificates: decryptedData.certificates || defaultCVData.certificates,
      languages: decryptedData.languages || defaultCVData.languages
    };
  } catch (error) {
    console.error('Error processing CV data:', error);
    return defaultCVData;
  }
};

export const getCVData = (): CVData => {
  const stored = localStorage.getItem('cvData');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Ensure all new fields exist
      return {
        ...defaultCVData,
        ...data,
        customTabs: data.customTabs || defaultCVData.customTabs,
        tabOrder: data.tabOrder || defaultCVData.tabOrder,
        assets: data.assets || defaultCVData.assets,
        coverLetters: data.coverLetters || defaultCVData.coverLetters
      };
    } catch (error) {
      console.error('Error parsing stored CV data:', error);
      return defaultCVData;
    }
  }
  return defaultCVData;
};

export const saveCVData = async (data: CVData): Promise<void> => {
  // localStorage.setItem('cvData', JSON.stringify(data)); // No longer save to localStorage
  try {
    // Encrypt the data before saving to Supabase
    const encryptedData = encryptData(data);
    
    await supabase.from('cv_data').upsert([
      { id: 'main', data: encryptedData }
    ], { onConflict: 'id' });
  } catch (error) {
    console.error('Error saving encrypted CV data to Supabase:', error);
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

export const calculateWorkDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0 && months > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    return 'Less than a month';
  }
};

export const downloadImage = async (imageUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

// Generic forced download for any file type
export const downloadFile = async (fileUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};
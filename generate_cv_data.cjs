require('dotenv').config({ path: './.env' });
const CryptoJS = require('crypto-js');

// Get encryption key from environment (same as the app uses)
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY') || 'ronydb-default-encryption-key-2025';

// Encrypt function (matches the app's encryptData)
const encryptData = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

// Default CV Data from cvData.ts
const defaultCVData = {
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
  "tabOrder": ["basics", "contacts", "work", "education", "skills", "certificates", "languages", "coverLetters", "projects", "academic", "backup-restore"],
  "assets": {
    "images": {},
    "pdfs": {}
  },
  "tools": [],
  "academic": [
    {
      "id": "1",
      "title": "SSC Certificate",
      "degreeName": "Secondary School Certificate",
      "instituteName": "Bogra Cantonment Public School & College",
      "instituteCode": "1234",
      "group": "Science",
      "session": "2013-2015",
      "examYear": "2015",
      "level": "Secondary",
      "board": "Rajshahi",
      "rollNumber": "123456",
      "registrationNumber": "987654",
      "dateOfBirth": "2000-01-01",
      "gender": "Male",
      "name": "Khalekuzzaman Rony",
      "fatherName": "Father's Name",
      "motherName": "Mother's Name",
      "gpa": "5.00",
      "files": [
        {
          "name": "SSC Certificate.pdf",
          "url": "https://example.com/ssc-certificate.pdf",
          "label": "SSC Certificate Document"
        },
        {
          "name": "Marksheet.pdf",
          "url": "https://example.com/marksheet.pdf",
          "label": "SSC Marksheet"
        }
      ],
      "customFields": []
    }
  ]
};

// Encrypt the CV data
const encryptedCVData = encryptData(defaultCVData);

console.log('==============================================');
console.log('Encrypted CV Data for SQL Insert');
console.log('==============================================');
console.log('');
console.log('--- SQL INSERT STATEMENT for cv_data ---');
console.log(`INSERT INTO public.cv_data (id, data) VALUES ('main', '${encryptedCVData}');`);
console.log('');
console.log('--- Copy and paste the above INSERT into your SQL Editor ---');
console.log('==============================================');

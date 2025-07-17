export interface CustomField {
  id: string;
  type: 'text' | 'link' | 'image' | 'date' | 'number';
  label: string;
  value: string;
  order: number;
}

export interface CustomTab {
  id: string;
  name: string;
  customFields: CustomField[];
}

export interface CVData {
  basics: {
    name: string;
    label: string;
    image: string;
    imageFile?: File;
    resume?: string;
    resumeFile?: File;
    summary: string;
    customFields: CustomField[];
    googleSheetDb?: string;
  };
  contacts: {
    email: string;
    phone: string;
    url: string;
    location: {
      city: string;
      country: string;
    };
    profiles: {
      network: string;
      username: string;
      url: string;
    }[];
    customFields: CustomField[];
  };
  work: {
    name: string;
    location: string;
    url: string;
    position: string;
    jobType: string;
    employeeType: string;
    startDate: string;
    endDate?: string;
    highlights: string[];
    customFields: CustomField[];
  }[];
  education: {
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    score: string;
    cgpa: string;
    scale: string;
    customFields: CustomField[];
  }[];
  skills: {
    technical: {
      name: string;
      keywords: string[];
    }[];
    methodologies: string[];
    customFields: CustomField[];
  };
  projects: any[];
  certificates: {
    name: string;
    date: string;
    issuer: string;
    url: string;
    customFields: CustomField[];
  }[];
  languages: {
    language: string;
    fluency: string;
    customFields: CustomField[];
  }[];
  coverLetters: {
    id: string;
    title: string;
    content: string;
  }[];
  tabOrder: string[];
  assets: {
    images: { [key: string]: string };
    pdfs: { [key: string]: string };
  };
  customTabs: CustomTab[];
  tools: {
    name: string;
    username: string;
    url: string;
    customFields: CustomField[];
  }[];
}
export interface CustomField {
  id: string;
  type: 'text' | 'link' | 'image' | 'date' | 'number' | 'file';
  label: string;
  value: string;
  order: number;
}

export interface CustomTab {
  id: string;
  name: string;
  customFields: CustomField[];
}

export interface PasswordVendorSubCard {
  email: string;
  username: string;
  password: string;
  recoveryPhone: string;
  recoveryEmail: string;
  modificationDate: string;
  twoFactorEnabled: boolean;
  twoFactorPhone: string;
  twoFactorEmail: string;
  twoFactorDetails: string;
  additionalData: string;
  isExpanded?: boolean;
}

export interface PasswordVendor {
  name: string;
  url: string;
  accounts: PasswordVendorSubCard[];
  isExpanded?: boolean;
}

export interface CVData {
  basics: {
    name: string;
    label: string;
    image: string;
    imageFile?: File;
    resume?: string;
    resumeFile?: File;
    resumeLabel?: string;
    summary: string;
    customFields: CustomField[];
    googleSheetDb?: string;
    googleSheetDbLabel?: string;
    customLink1?: string;
    customLink2?: string;
    customLink3?: string;
    customLink4?: string;
    customLink5?: string;
    customLink6?: string;
    customLink1Label?: string;
    customLink2Label?: string;
    customLink3Label?: string;
    customLink4Label?: string;
    customLink5Label?: string;
    customLink6Label?: string;
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
  passwordBank: PasswordVendor[];
}
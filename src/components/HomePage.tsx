import React, { useEffect } from 'react';
import { Copy, Download, ChevronDown, ExternalLink, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Award, Globe, FileText, Settings, Hash } from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaTelegram, FaReddit, FaDiscord, FaSnapchatGhost, FaPinterest, FaMedium, FaDribbble, FaBehance, FaStackOverflow, FaFacebookMessenger, FaGlobe } from 'react-icons/fa';
import CopyButton from './CopyButton';
import CustomFieldRenderer from './CustomFieldRenderer';
import { CVData, CustomField } from '../types/cv';
import { supabase } from '../utils/supabaseClient';
import { downloadFile } from '../utils/cvData';
import { fetchCVDataFromSupabase } from '../utils/cvData';
import ThemeToggle from './ThemeToggle';

interface HomePageProps {
  cvData: CVData;
  setCvData: (data: CVData) => void;
  onNavigateToDashboard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ cvData, setCvData, onNavigateToDashboard }) => {
  // Set browser tab title
  React.useEffect(() => {
    document.title = 'Rony.DB';
  }, []);

  const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch public URLs from Supabase Storage
    const fetchUrls = async () => {
      const { data: pdfData } = supabase.storage.from('files').getPublicUrl('Khalekuzzaman_Rony-SQA.pdf');
      setResumeUrl(pdfData.publicUrl);
      const { data: imgData } = supabase.storage.from('files').getPublicUrl('khalekuzzamanRony.png');
      setImageUrl(imgData.publicUrl);
    };
    fetchUrls();
  }, []);

  React.useEffect(() => {
    // Subscribe to realtime changes on cv_data table
    const channel = supabase
      .channel('public:cv_data')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cv_data' },
        async (payload) => {
          console.log('Realtime event:', payload);
          const latest = await fetchCVDataFromSupabase();
          if (latest) {
            setCvData(latest); // This updates the UI!
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setCvData]);

  // Expand/collapse state for sections and custom tabs
  const tabOrder = cvData.tabOrder || ['basics', 'contacts', 'work', 'education', 'skills', 'projects', 'certificates', 'languages', 'coverLetters'];
  const customTabs = cvData.customTabs || [];
  const allSectionKeys = [...tabOrder, ...customTabs.map(tab => tab.id)];
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(
    Object.fromEntries(allSectionKeys.map((key) => [key, true]))
  );
  
  // State for cover letter form fields
  const [coverLetterFields, setCoverLetterFields] = React.useState({
    companyName: '',
    position: '',
    hrName: '',
    currentCompany: ''
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv-data.json';
    link.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadAsPDF = () => {
    // Simple PDF generation - in a real app, you'd use a proper PDF library
    const content = `
CV - ${cvData.basics.name}

BASIC INFORMATION
Name: ${cvData.basics.name}
Label: ${cvData.basics.label}
Email: ${cvData.contacts.email ?? ''}
Phone: ${cvData.contacts.phone ?? ''}
Location: ${cvData.contacts.location?.city ?? ''}, ${cvData.contacts.location?.country ?? ''}
Website: ${cvData.contacts.url ?? ''}

SUMMARY
${cvData.basics.summary}

WORK EXPERIENCE
${cvData.work.map(job => `
${job.position} at ${job.name}
${job.startDate} - ${job.endDate || 'Present'}
Location: ${job.location}
${job.highlights.map(highlight => `• ${highlight}`).join('\n')}
`).join('\n')}

EDUCATION
${cvData.education.map(edu => `
${edu.studyType} in ${edu.area}
${edu.institution}
${edu.startDate} - ${edu.endDate}
Score: ${edu.score}
`).join('\n')}

SKILLS
${cvData.skills.technical.map(skill => `
${skill.name}: ${skill.keywords.join(', ')}
`).join('\n')}

CERTIFICATES
${cvData.certificates.map(cert => `
${cert.name} - ${cert.issuer} (${cert.date})
`).join('\n')}

LANGUAGES
${cvData.languages.map(lang => `
${lang.language}: ${lang.fluency}
`).join('\n')}
    `;

    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv.txt';
    link.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const handleImageDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  // Forced download handler for Supabase Storage files
  const handleDownload = async (filePath: string, filename: string) => {
    const { data, error } = await supabase.storage.from('files').download(filePath);
    if (error) {
      alert('Download failed!');
      return;
    }
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Helper to force download from a public URL with a given filename
  const forceDownloadFromUrl = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert('Download failed!');
    }
  };

  // Helper to extract the exact filename from a Supabase Storage public URL
  const getFilenameFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname.split('/').pop() || 'resume';
    } catch {
      return url.split('/').pop() || 'resume';
    }
  };

  // Helper to add cache-busting param to a URL
  const cacheBustedUrl = (url: string) => url ? url + (url.includes('?') ? '&' : '?') + 't=' + Date.now() : url;

  // Modal state for Google Sheet DB validation
  const [showSheetModal, setShowSheetModal] = React.useState(false);
  const [sheetModalUrl, setSheetModalUrl] = React.useState('');
  const [sheetUsername, setSheetUsername] = React.useState('');
  const [sheetPassword, setSheetPassword] = React.useState('');
  const [sheetName, setSheetName] = React.useState('');
  const [sheetError, setSheetError] = React.useState('');

  // Hardcoded credentials for Google Sheet DB access
  const GOOGLE_SHEET_CREDENTIALS = {
    username: 'rony@admin',
    password: '###Rony@@@7669!!!',
    name: 'rroinay',
  };

  const openSheetModal = (url: string) => {
    setSheetModalUrl(url);
    setSheetUsername('');
    setSheetPassword('');
    setSheetName('');
    setSheetError('');
    setShowSheetModal(true);
  };

  const handleSheetModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetUsername !== GOOGLE_SHEET_CREDENTIALS.username) {
      setSheetError('Invalid username.');
      return;
    }
    if (sheetPassword !== GOOGLE_SHEET_CREDENTIALS.password) {
      setSheetError('Invalid password.');
      return;
    }
    if (sheetName !== GOOGLE_SHEET_CREDENTIALS.name) {
      setSheetError('Invalid name.');
      return;
    }
    setShowSheetModal(false);
    window.open(sheetModalUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to force download a cover letter as txt
  const downloadCoverLetter = (title: string, content: string) => {
    // Apply any active replacements from the form fields
    const modifiedContent = applyReplacements(content);
    
    const blob = new Blob([modifiedContent], { type: 'text/plain' });
    // Sanitize title for filename
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTitle || 'cover_letter'}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  // Function to apply replacements to cover letter content
  const applyReplacements = (content: string) => {
    let modifiedContent = content;
    
    // Replace placeholders with values from state
    const replacements = [
      { placeholder: '$company_name', value: coverLetterFields.companyName },
      { placeholder: '$position', value: coverLetterFields.position },
      { placeholder: '$hr_name', value: coverLetterFields.hrName },
      { placeholder: '$current_company', value: coverLetterFields.currentCompany }
    ];
    
    replacements.forEach(({ placeholder, value }) => {
      if (value.trim()) {
        // Replace all occurrences of the placeholder with the value
        // Escape special characters in the placeholder for regex
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        modifiedContent = modifiedContent.replace(new RegExp(escapedPlaceholder, 'g'), value.trim());
      }
    });
    
    return modifiedContent;
  };

  const renderCustomTab = (tab: import('../types/cv').CustomTab) => {
    if (!tab.customFields || tab.customFields.length === 0) return null;
    const expanded = expandedSections[tab.id] ?? true;
    return (
      <section key={tab.id} className="mb-8">
        <div className="bg-card border border-border rounded-lg shadow-md">
          <div
            className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
            onClick={() => toggleSection(tab.id)}
          >
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold text-primary flex-1">{tab.name}</h2>
            <span className="ml-2">
              <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
            </span>
          </div>
          {expanded && (
            <div className="p-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-4">
                {tab.customFields.map((field: CustomField) => (
                  <div key={field.id} className="bg-sectionheader flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                    <div className="flex-1">
                      <CustomFieldRenderer field={field} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSection = (sectionName: string) => {
    const expanded = expandedSections[sectionName] ?? true;
    switch (sectionName) {
      case 'basics':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('basics')}
              >
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Basic Information</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="flex flex-col items-center">
                        <img
                          src={cvData.basics.image}
                          alt={cvData.basics.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                        />
                        <div className="flex flex-row items-center mt-3 gap-2">
                          <CopyButton text={cvData.basics.image} className="h-10" />
                          <button
                            onClick={() => downloadFile(cvData.basics.image, getFilenameFromUrl(cvData.basics.image))}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                            title="Download image"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                        <div className="flex-1 min-w-0">
                          <h1 className="text-3xl font-bold text-primary truncate min-w-0">{cvData.basics.name}</h1>
                        </div>
                        <CopyButton text={cvData.basics.name} className="ml-1 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mb-4 w-full overflow-hidden">
                        <div className="flex-1 min-w-0">
                          <p className="text-xl text-primary font-medium truncate">{cvData.basics.label}</p>
                        </div>
                        <CopyButton text={cvData.basics.label} className="ml-1 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between w-full overflow-hidden">
                        <div className="flex-1 min-w-0">
                          <p className="text-secondary break-words whitespace-pre-line">{cvData.basics.summary}</p>
                        </div>
                        <CopyButton text={cvData.basics.summary} className="ml-1 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {cvData.basics.resume || cvData.basics.googleSheetDb ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Resume Row */}
                      {cvData.basics.resume && (
                        <div className="p-4 bg-sectionheader rounded-lg flex flex-col justify-center">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="font-medium text-secondary">Resume</span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <CopyButton text={cvData.basics.resume} />
                              <a
                                href={cacheBustedUrl(cvData.basics.resume)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                                title="Open resume"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => forceDownloadFromUrl(cacheBustedUrl(cvData.basics.resume ?? ''), getFilenameFromUrl(cvData.basics.resume ?? 'resume'))}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                                title="Download resume"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Google Sheet DB Row */}
                      {cvData.basics.googleSheetDb && (
                        <div className="p-4 bg-sectionheader rounded-lg flex flex-col justify-center">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-medium text-secondary">Google Sheet DB</span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <CopyButton text={cvData.basics.googleSheetDb} />
                              <button
                                onClick={() => openSheetModal(cacheBustedUrl(cvData.basics.googleSheetDb || ''))}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                                title="Open Google Sheet"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Custom Link 1 Row */}
                      {cvData.basics.customLink1 && (
                        <div className="p-4 bg-sectionheader rounded-lg flex flex-col justify-center">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-purple-600 mr-2" />
                              <span className="font-medium text-secondary">{cvData.basics.customLink1Label || 'Custom Link 1'}</span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <CopyButton text={cvData.basics.customLink1} />
                              <a
                                href={cvData.basics.customLink1}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                                title="Open Custom Link 1"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Custom Link 2 Row */}
                      {cvData.basics.customLink2 && (
                        <div className="p-4 bg-sectionheader rounded-lg flex flex-col justify-center">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-purple-600 mr-2" />
                              <span className="font-medium text-secondary">{cvData.basics.customLink2Label || 'Custom Link 2'}</span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <CopyButton text={cvData.basics.customLink2} />
                              <a
                                href={cvData.basics.customLink2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                                title="Open Custom Link 2"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Custom Fields Row: show two per row, styled like Resume */}
                  {cvData.basics.customFields && cvData.basics.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cvData.basics.customFields
                        .filter(field => {
                          const label = (field.label || '').trim().toLowerCase();
                          return label !== 'resume_compressed (google drive)'.toLowerCase() && label !== 'resume (google drive)'.toLowerCase();
                        })
                        .map((field, idx) => (
                        <div key={field.id} className="p-4 bg-sectionheader rounded-lg flex flex-col justify-center min-h-[88px]">
                          <CustomFieldRenderer field={field} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case 'contacts':
        // Helper to get the correct icon for a social network
        const getSocialIcon = (network: string) => {
          switch ((network || '').toLowerCase()) {
            case 'linkedin':
              return <FaLinkedin className="w-5 h-5 text-blue-600 mr-3" />;
            case 'github':
              return <FaGithub className="w-5 h-5 text-secondary mr-3" />;
            case 'twitter':
              return <FaTwitter className="w-5 h-5 text-blue-400 mr-3" />;
            case 'facebook':
              return <FaFacebook className="w-5 h-5 text-blue-700 mr-3" />;
            case 'messenger':
              return <FaFacebookMessenger className="w-5 h-5 text-blue-500 mr-3" />;
            case 'instagram':
              return <FaInstagram className="w-5 h-5 text-pink-500 mr-3" />;
            case 'youtube':
              return <FaYoutube className="w-5 h-5 text-red-600 mr-3" />;
            case 'tiktok':
              return <FaTiktok className="w-5 h-5 text-black mr-3" />;
            case 'whatsapp':
              return <FaWhatsapp className="w-5 h-5 text-green-500 mr-3" />;
            case 'telegram':
              return <FaTelegram className="w-5 h-5 text-blue-400 mr-3" />;
            case 'reddit':
              return <FaReddit className="w-5 h-5 text-orange-500 mr-3" />;
            case 'discord':
              return <FaDiscord className="w-5 h-5 text-indigo-500 mr-3" />;
            case 'snapchat':
              return <FaSnapchatGhost className="w-5 h-5 text-yellow-400 mr-3" />;
            case 'pinterest':
              return <FaPinterest className="w-5 h-5 text-red-500 mr-3" />;
            case 'medium':
              return <FaMedium className="w-5 h-5 text-green-700 mr-3" />;
            case 'dribbble':
              return <FaDribbble className="w-5 h-5 text-pink-400 mr-3" />;
            case 'behance':
              return <FaBehance className="w-5 h-5 text-blue-500 mr-3" />;
            case 'stack overflow':
              return <FaStackOverflow className="w-5 h-5 text-orange-400 mr-3" />;
            default:
              return <FaGlobe className="w-5 h-5 text-blue-600 mr-3" />;
          }
        };
        // Helper to get the correct icon for a tool
        const getToolIcon = (name: string) => {
          switch ((name || '').toLowerCase()) {
            case 'vscode':
              return <FaGithub className="w-5 h-5 text-blue-600 mr-3" />;
            case 'github':
              return <FaGithub className="w-5 h-5 text-secondary mr-3" />;
            case 'figma':
              return <FaDribbble className="w-5 h-5 text-pink-400 mr-3" />;
            case 'notion':
              return <FaGlobe className="w-5 h-5 text-secondary mr-3" />;
            case 'slack':
              return <FaDiscord className="w-5 h-5 text-indigo-500 mr-3" />;
            case 'jira':
              return <FaGlobe className="w-5 h-5 text-blue-600 mr-3" />;
            case 'trello':
              return <FaGlobe className="w-5 h-5 text-blue-400 mr-3" />;
            default:
              return <FaGlobe className="w-5 h-5 text-secondary mr-3" />;
          }
        };
        // Gather all contact items (email, phone, location, url) into a flat array
        const basicContacts = [
          {
            icon: <Mail className="w-5 h-5 text-blue-600 mr-3" />, label: cvData.contacts.email, type: 'email', value: cvData.contacts.email, isLink: false, isProfile: false, network: undefined, username: undefined
          },
          {
            icon: <Phone className="w-5 h-5 text-blue-600 mr-3" />, label: cvData.contacts.phone, type: 'phone', value: cvData.contacts.phone, isLink: false, isProfile: false, network: undefined, username: undefined
          },
          {
            icon: <MapPin className="w-5 h-5 text-blue-600 mr-3" />, label: `${cvData.contacts.location.city}, ${cvData.contacts.location.country}`, type: 'location', value: `${cvData.contacts.location.city}, ${cvData.contacts.location.country}`, isLink: false, isProfile: false, network: undefined, username: undefined
          },
          {
            icon: <Globe className="w-5 h-5 text-blue-600 mr-3" />, label: cvData.contacts.url, type: 'url', value: cvData.contacts.url, isLink: true, isProfile: false, network: undefined, username: undefined
          },
        ];
        // Social profiles
        const socialProfiles = cvData.contacts.profiles.map(profile => ({
          icon: getSocialIcon(profile.network),
          label: undefined,
          network: profile.network,
          username: profile.username,
          type: profile.network,
          value: profile.url,
          isProfile: true,
          isLink: false
        }));
        // Tools
        const toolProfiles = (cvData.tools || []).map(tool => ({
          icon: getToolIcon(tool.name),
          label: undefined,
          name: tool.name,
          username: tool.username,
          type: tool.name,
          value: tool.url,
          isTool: true,
          isLink: false
        }));
        // Split into two balanced columns for each category
        const splitColumns = <T,>(items: T[]): [T[], T[]] => {
          const mid = Math.ceil(items.length / 2);
          return [items.slice(0, mid), items.slice(mid)];
        };
        const [basicCol1, basicCol2] = splitColumns(basicContacts);
        const [socialCol1, socialCol2] = splitColumns(socialProfiles);
        const [toolCol1, toolCol2] = splitColumns(toolProfiles);
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('contacts')}
              >
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Contact Information</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  {/* Basic Contacts */}
                  <h3 className="font-semibold text-secondary mb-2">Basic Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4 md:pr-4 md:border-r md:border-border">
                      {basicCol1.map((item: typeof basicContacts[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            {item.isLink ? (
                              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                {item.label}
                              </a>
                            ) : (
                              <span className="text-secondary truncate">{item.label}</span>
                            )}
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {basicCol2.map((item: typeof basicContacts[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            {item.isLink ? (
                              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                {item.label}
                              </a>
                            ) : (
                              <span className="text-secondary truncate">{item.label}</span>
                            )}
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Social Links */}
                  <h3 className="font-semibold text-secondary mb-2">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4 md:pr-4 md:border-r md:border-border">
                      {socialCol1.map((item: typeof socialProfiles[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            <span className="text-secondary mr-1">{item.network}:</span>
                            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {item.username}
                            </a>
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {socialCol2.map((item: typeof socialProfiles[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            <span className="text-secondary mr-1">{item.network}:</span>
                            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {item.username}
                            </a>
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* My Tools */}
                  <h3 className="font-semibold text-secondary mb-2">My Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4 md:pr-4 md:border-r md:border-border">
                      {toolCol1.map((item: typeof toolProfiles[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            <span className="text-secondary mr-1">{item.name}:</span>
                            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {item.username}
                            </a>
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {toolCol2.map((item: typeof toolProfiles[number], idx: number) => (
                        <div key={idx} className="flex items-center w-full justify-between bg-sectionheader p-3 rounded-lg">
                          <div className="flex items-center flex-grow min-w-0">
                            {item.icon}
                            <span className="text-secondary mr-1">{item.name}:</span>
                            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {item.username}
                            </a>
                          </div>
                          <CopyButton text={item.value} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {cvData.contacts?.customFields && cvData.contacts.customFields.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <h3 className="font-semibold text-secondary col-span-full">Additional Contact Info</h3>
                      {cvData.contacts.customFields.map((field: CustomField) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                          <div className="flex-1">
                            <CustomFieldRenderer field={field} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case 'work':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('work')}
              >
                <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Work Experience</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="space-y-4">
                    {cvData.work.map((job, index) => (
                      <div key={index} className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-secondary truncate">{job.position}</h3>
                              </div>
                              <CopyButton text={job.position} className="ml-1 flex-shrink-0" />
                            </div>
                            <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                              <div className="flex items-center flex-1 min-w-0">
                                <p className="text-blue-600 font-medium truncate">{job.name}</p>
                                {job.url && (
                                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                              <CopyButton text={job.name} className="ml-1 flex-shrink-0" />
                            </div>
                            <div className="flex items-center text-secondary mb-2 w-full overflow-hidden">
                              <div className="flex items-center flex-1 min-w-0">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="truncate">{job.location}</span>
                              </div>
                              <CopyButton text={job.location} className="ml-1 flex-shrink-0" />
                            </div>
                            <div className="flex items-center text-secondary mb-2 w-full overflow-hidden">
                              <div className="flex items-center flex-1 min-w-0">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span className="truncate">{job.startDate} - {job.endDate || 'Present'}</span>
                                <span className="ml-2 text-sm text-secondary truncate">
                                  ({calculateDuration(job.startDate, job.endDate)})
                                </span>
                              </div>
                              <CopyButton text={`${job.startDate} - ${job.endDate || 'Present'}`} className="ml-1 flex-shrink-0" />
                            </div>
                            {job.jobType && (
                              <div className="flex items-center text-secondary mb-2 w-full overflow-hidden">
                                <div className="flex items-center flex-1 min-w-0">
                                  <span className="font-medium">Job Type:</span>
                                  <span className="ml-2 truncate">{job.jobType}</span>
                                </div>
                                <CopyButton text={job.jobType} className="ml-1 flex-shrink-0" />
                              </div>
                            )}
                            {job.employeeType && (
                              <div className="flex items-center text-secondary mb-2 w-full overflow-hidden">
                                <div className="flex items-center flex-1 min-w-0">
                                  <span className="font-medium">Employee Type:</span>
                                  <span className="ml-2 truncate">{job.employeeType}</span>
                                </div>
                                <CopyButton text={job.employeeType} className="ml-1 flex-shrink-0" />
                              </div>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {job.highlights.map((highlight, highlightIndex) => (
                            <li key={highlightIndex} className="flex items-start w-full justify-between">
                              <div className="flex items-start flex-1 min-w-0">
                                <span className="text-blue-600 mr-2">•</span>
                                <span className="text-secondary flex-1 min-w-0 truncate">{highlight}</span>
                              </div>
                              <CopyButton text={highlight} className="ml-1 flex-shrink-0" />
                            </li>
                          ))}
                        </ul>

                        {job.customFields && job.customFields.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {job.customFields.map((field: CustomField) => (
                              <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                                <div className="flex-1">
                                  <CustomFieldRenderer field={field} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'education':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('education')}
              >
                <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Education</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="space-y-4">
                    {cvData.education.map((edu, index) => (
                      <div key={index} className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-secondary truncate">{edu.studyType} in {edu.area}</h3>
                          </div>
                          <CopyButton text={`${edu.studyType} in ${edu.area}`} className="ml-1 flex-shrink-0" />
                        </div>
                        <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                          <div className="flex items-center flex-1 min-w-0">
                            <p className="text-blue-600 font-medium truncate">{edu.institution}</p>
                            {edu.url && (
                              <a href={edu.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <CopyButton text={edu.institution} className="ml-1 flex-shrink-0" />
                        </div>
                        <div className="flex items-center text-secondary mb-2 w-full overflow-hidden">
                          <div className="flex items-center flex-1 min-w-0">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="truncate">{edu.startDate} - {edu.endDate}</span>
                          </div>
                          <CopyButton text={`${edu.startDate} - ${edu.endDate}`} className="ml-1 flex-shrink-0" />
                        </div>
                        {edu.score && (
                          <div className="flex items-center text-secondary overflow-hidden justify-between">
                            <span className="font-medium">Score:</span>
                            <span className="ml-2">{edu.cgpa && edu.scale ? `CGPA: ${edu.cgpa}/${edu.scale}` : edu.score}</span>
                            <div className="flex flex-row gap-2 ml-auto">
                              <CopyButton text={edu.cgpa && edu.scale ? `CGPA: ${edu.cgpa}/${edu.scale}` : edu.score} className="ml-1" />
                            </div>
                          </div>
                        )}

                        {edu.customFields && edu.customFields.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {edu.customFields.map((field: CustomField) => (
                              <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                                <div className="flex-1">
                                  <CustomFieldRenderer field={field} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'skills':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('skills')}
              >
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Skills</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-sectionheader p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-primary mb-4">Technical Skills</h3>
                  <div className="space-y-6">
                    {cvData.skills.technical.map((skillGroup, index) => (
                            <div key={index} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Hash className="w-5 h-5 text-blue-600" />
                                  <h4 className="text-lg font-medium text-secondary">{skillGroup.name}</h4>
                          </div>
                                <CopyButton text={skillGroup.name} className="flex-shrink-0" />
                        </div>
                              <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex flex-wrap gap-2">
                          {skillGroup.keywords.map((skill, skillIndex) => (
                                    <div key={skillIndex} 
                                      className="group relative flex items-center px-3 py-1.5 bg-bg hover:bg-primary hover:text-white transition-colors duration-200 rounded-lg text-sm font-medium border border-border">
                              <span className="truncate">{skill}</span>
                                      <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <CopyButton text={skill} className="ml-2" />
                                      </div>
                            </div>
                          ))}
                                </div>
                        </div>
                      </div>
                    ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                    {cvData.skills.methodologies.length > 0 && (
                        <div className="bg-sectionheader p-6 rounded-lg">
                          <div className="flex items-center gap-2 mb-4">
                            <Award className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-semibold text-primary">Methodologies</h3>
                        </div>
                          <div className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex flex-wrap gap-2">
                          {cvData.skills.methodologies.map((methodology, index) => (
                                <div key={index} 
                                  className="group relative flex items-center px-3 py-1.5 bg-bg hover:bg-primary hover:text-white transition-colors duration-200 rounded-lg text-sm font-medium border border-border">
                              <span className="truncate">{methodology}</span>
                                  <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <CopyButton text={methodology} className="ml-2" />
                                  </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                      )}

                  {cvData.skills?.customFields && cvData.skills.customFields.length > 0 && (
                        <div className="bg-sectionheader p-6 rounded-lg">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-semibold text-primary">Additional Skills</h3>
                          </div>
                          <div className="space-y-3">
                      {cvData.skills.customFields.map((field: CustomField) => (
                              <div key={field.id} className="bg-card p-4 rounded-lg border border-border">
                            <CustomFieldRenderer field={field} />
                        </div>
                      ))}
                          </div>
                    </div>
                  )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'projects':
        if (!cvData.projects || cvData.projects.length === 0) return null;
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('projects')}
              >
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Projects</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="space-y-4">
                    {cvData.projects.map((project, index) => (
                      <div key={index} className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                          <div className="flex-1 min-w-0 flex items-center">
                            <h3 className="text-xl font-semibold text-secondary truncate">{project.name}</h3>
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <CopyButton text={project.name} className="ml-1 flex-shrink-0" />
                        </div>
                        {project.description && (
                          <div className="flex items-center justify-between mb-2 w-full">
                            <div className="flex-1 min-w-0">
                              <p className="text-secondary whitespace-pre-wrap">{project.description}</p>
                            </div>
                            <CopyButton text={project.description} className="ml-1 flex-shrink-0" />
                          </div>
                        )}
                        {project.contributions && project.contributions.length > 0 && (
                          <ul className="space-y-2 mt-2">
                            {project.contributions.map((contribution: string, cIndex: number) => (
                              <li key={cIndex} className="flex items-start w-full justify-between">
                                <div className="flex items-start flex-1 min-w-0">
                                  <span className="text-blue-600 mr-2">•</span>
                                  <span className="text-secondary flex-1 min-w-0">{contribution}</span>
                            </div>
                                <CopyButton text={contribution} className="ml-1 flex-shrink-0" />
                              </li>
                            ))}
                          </ul>
                        )}
                        {project.customFields && project.customFields.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.customFields.map((field: CustomField) => (
                              <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                                <div className="flex-1">
                                  <CustomFieldRenderer field={field} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'certificates':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('certificates')}
              >
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Certificates</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="space-y-4">
                    {cvData.certificates.map((cert, index) => (
                      <div key={index} className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-secondary truncate">{cert.name}</h3>
                          </div>
                          <CopyButton text={cert.name} className="ml-1 flex-shrink-0" />
                        </div>
                        <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-600 font-medium truncate">{cert.issuer}</p>
                          </div>
                          <CopyButton text={cert.issuer} className="ml-1 flex-shrink-0" />
                        </div>
                        <div className="flex items-center mb-2 w-full overflow-hidden">
                          <div className="flex items-center flex-1 min-w-0">
                            <Calendar className="w-4 h-4 mr-1 text-secondary" />
                            <span className="text-secondary truncate">{cert.date}</span>
                          </div>
                          <CopyButton text={cert.date} className="ml-1 flex-shrink-0" />
                        </div>
                        {cert.url && (
                          <div className="flex items-center overflow-hidden justify-between">
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              View Certificate
                            </a>
                            <div className="flex flex-row gap-2 ml-auto">
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200 ml-1"
                                title="Open in new tab"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m5-3h3m0 0v3m0-3L10 14" /></svg>
                              </a>
                              <CopyButton text={cert.url} className="ml-1" />
                            </div>
                          </div>
                        )}

                        {cert.customFields && cert.customFields.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cert.customFields.map((field: CustomField) => (
                              <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                                <div className="flex-1">
                                  <CustomFieldRenderer field={field} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'languages':
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('languages')}
              >
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Languages</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cvData.languages.map((lang, index) => (
                      <div key={index} className="bg-sectionheader flex items-center justify-between w-full overflow-hidden p-3 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-secondary truncate">{lang.language}</span>
                          <span className="text-secondary ml-2 truncate">({lang.fluency})</span>
                        </div>
                        <CopyButton text={`${lang.language} - ${lang.fluency}`} className="flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  {cvData.languages?.[0]?.customFields && cvData.languages[0].customFields.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cvData.languages[0].customFields.map((field: CustomField) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                          <div className="flex-1">
                            <CustomFieldRenderer field={field} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case 'coverLetters':
        if (!cvData.coverLetters || cvData.coverLetters.length === 0) return null;
        return (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              <div
                className="flex items-center cursor-pointer select-none bg-sectionheader px-6 py-4 rounded-t-lg border-b border-border"
                onClick={() => toggleSection('coverLetters')}
              >
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold text-primary flex-1">Cover Letters</h2>
                <span className="ml-2">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
                </span>
              </div>
              {expanded && (
                <div className="p-6 pt-4">
                  {/* Global Cover Letter Customization Fields */}
                  <div className="mb-6 bg-card border border-border rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-secondary">Customize All Cover Letters</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Reset all fields
                            setCoverLetterFields({
                              companyName: '',
                              position: '',
                              hrName: '',
                              currentCompany: ''
                            });
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                          title="Reset Fields"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            // Force a re-render to apply replacements
                            setCoverLetterFields({...coverLetterFields});
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                          title="Apply Changes"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">Company Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter company name" 
                          className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-replace="$company_name"
                          value={coverLetterFields.companyName}
                          onChange={(e) => {
                            setCoverLetterFields(prev => ({ ...prev, companyName: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">Position</label>
                        <input 
                          type="text" 
                          placeholder="Enter position" 
                          className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-replace="$position"
                          value={coverLetterFields.position}
                          onChange={(e) => {
                            setCoverLetterFields(prev => ({ ...prev, position: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">HR Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter HR name" 
                          className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-replace="$hr_name"
                          value={coverLetterFields.hrName}
                          onChange={(e) => {
                            setCoverLetterFields(prev => ({ ...prev, hrName: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">Current Company</label>
                        <select 
                          className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-replace="$current_company"
                          value={coverLetterFields.currentCompany}
                          onChange={(e) => {
                            setCoverLetterFields(prev => ({ ...prev, currentCompany: e.target.value }));
                          }}
                        >
                          <option value="">Select current company</option>
                          {cvData.work.map((job, idx) => (
                            <option key={idx} value={job.name}>{job.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {cvData.coverLetters.map((coverLetter: { id: string; title: string; content: string; customFields?: import('../types/cv').CustomField[] }, index: number) => (
                      <div key={index} className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4 w-full overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-secondary truncate">{coverLetter.title}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <CopyButton text={coverLetter.title} className="ml-1 flex-shrink-0" />
                            <button
                              onClick={() => downloadCoverLetter(coverLetter.title, coverLetter.content)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                              title="Download as TXT"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-start justify-between w-full overflow-hidden">
                          <p className="text-secondary whitespace-pre-wrap flex-1 min-w-0 truncate">
                            {/* Display a preview with replacements applied */}
                            {applyReplacements(coverLetter.content)}
                          </p>
                          <CopyButton 
                            text={applyReplacements(coverLetter.content)} 
                            className="ml-1 flex-shrink-0" 
                          />
                        </div>
                        {coverLetter.customFields && coverLetter.customFields.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coverLetter.customFields.map((field: CustomField) => (
                              <div key={field.id} className="flex items-center justify-between p-3 bg-row rounded-lg break-inside-avoid overflow-hidden break-words">
                                <div className="flex-1">
                                  <CustomFieldRenderer field={field} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Build a map for custom tabs
  const customTabsMap = Object.fromEntries(customTabs.map(tab => [tab.id, tab]));
  // List of built-in section names
  const builtInSections = [
    'basics', 'contacts', 'tools', 'work', 'education', 'skills', 'certificates', 'languages', 'coverLetters', 'projects'
  ];
  // Render all sections (built-in and custom) in tabOrder
  const renderAllSections = () =>
    tabOrder.map(sectionName => {
      if (builtInSections.includes(sectionName)) {
        return renderSection(sectionName);
      }
      // Custom tab
      const customTab = customTabsMap[sectionName];
      if (customTab) return renderCustomTab(customTab);
      return null;
    });

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex justify-end p-4">
        {/* Remove the old ThemeToggle from the top right outside the header. */}
      </div>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
        {/* Header */}
        <header className="flex flex-row items-center justify-between mb-8 gap-2">
          <div className="text-2xl font-bold text-primary">Rony.DB</div>
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={onNavigateToDashboard}
              className="bg-card text-primary rounded-full hover:bg-sectionheader transition-colors flex items-center justify-center w-10 h-10 border border-border"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={downloadAsJSON}
              className="bg-card text-primary rounded-full hover:bg-sectionheader transition-colors flex items-center justify-center w-10 h-10 border border-border"
              title="Download as JSON"
              aria-label="Download as JSON"
            >
              <Download className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Render all sections in tabOrder (built-in and custom) */}
        {renderAllSections()}
      </div>

      {/* Google Sheet DB Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-primary">Google Sheet DB Access</h2>
            <form onSubmit={handleSheetModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Username</label>
                <input
                  type="text"
                  value={sheetUsername}
                  onChange={e => setSheetUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Password</label>
                <input
                  type="password"
                  value={sheetPassword}
                  onChange={e => setSheetPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={e => setSheetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {sheetError && <div className="text-red-600 text-sm">{sheetError}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-secondary hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
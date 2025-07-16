import React from 'react';
import { Copy, Download, ChevronDown, ExternalLink, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Award, Globe, FileText, Settings } from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaTelegram, FaReddit, FaDiscord, FaSnapchatGhost, FaPinterest, FaMedium, FaDribbble, FaBehance, FaStackOverflow, FaFacebookMessenger, FaGlobe } from 'react-icons/fa';
import CopyButton from './CopyButton';
import CustomFieldRenderer from './CustomFieldRenderer';
import { CVData } from '../types/cv';

interface HomePageProps {
  cvData: CVData;
  onNavigateToDashboard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ cvData, onNavigateToDashboard }) => {
  const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);

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
Email: ${cvData.basics.email}
Phone: ${cvData.basics.phone}
Location: ${cvData.basics.location.city}, ${cvData.basics.location.country}
Website: ${cvData.basics.url}

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

  const renderCustomTab = (tab: any) => {
    if (!tab.fields || tab.fields.length === 0) return null;

    return (
      <section key={tab.id} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          {tab.name}
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tab.fields.map((field: any) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
                <div className="flex-1">
                  <CustomFieldRenderer field={field} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const tabOrder = cvData.tabOrder || ['basics', 'contacts', 'work', 'education', 'skills', 'projects', 'certificates', 'languages', 'coverLetters'];
  const customTabs = cvData.customTabs || [];

  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case 'basics':
        return (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
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
                        onClick={() => handleImageDownload(cvData.basics.image, 'profile-image.jpg')}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors duration-200"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">{cvData.basics.name}</h1>
                    <CopyButton text={cvData.basics.name} className="ml-1" />
                  </div>
                  <div className="flex items-center mb-4">
                    <p className="text-xl text-blue-600 font-medium">{cvData.basics.label}</p>
                    <CopyButton text={cvData.basics.label} className="ml-1" />
                  </div>
                  <div className="flex items-center">
                    <p className="text-gray-600">{cvData.basics.summary}</p>
                    <CopyButton text={cvData.basics.summary} className="ml-1" />
                  </div>
                </div>
              </div>

              {cvData.basics.resume && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700">Resume</span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <CopyButton text={cvData.basics.resume} />
                      <a
                        href={cvData.basics.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open resume"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={cvData.basics.resume}
                        download
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download resume"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {/* New local files row */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local PDF column */}
                <div className="p-4 bg-gray-50 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700">Local Resume (PDF)</span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <CopyButton text={"/src/files/Khalekuzzaman_Rony-SQA.pdf"} />
                      <a
                        href={"/src/files/Khalekuzzaman_Rony-SQA.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open local resume"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={"/src/files/Khalekuzzaman_Rony-SQA.pdf"}
                        download
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download local resume"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* Local Image column */}
                <div className="p-4 bg-gray-50 rounded-lg flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={"/src/files/khalekuzzamanRony.png"}
                      alt="Khalekuzzaman Rony"
                      className="w-20 h-20 object-cover rounded border mr-3"
                    />
                    <div className="flex space-x-2 items-center">
                      <CopyButton text={"/src/files/khalekuzzamanRony.png"} />
                      <a
                        href={"/src/files/khalekuzzamanRony.png"}
                        download
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {cvData.basics.customFields && cvData.basics.customFields.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cvData.basics.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
                      <div className="flex-1">
                        <CustomFieldRenderer field={field} />
                      </div>
                    </div>
                  ))}
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
              return <FaGithub className="w-5 h-5 text-gray-800 mr-3" />;
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
              return <FaGithub className="w-5 h-5 text-gray-800 mr-3" />;
            case 'figma':
              return <FaDribbble className="w-5 h-5 text-pink-400 mr-3" />;
            case 'notion':
              return <FaGlobe className="w-5 h-5 text-gray-400 mr-3" />;
            case 'slack':
              return <FaDiscord className="w-5 h-5 text-indigo-500 mr-3" />;
            case 'jira':
              return <FaGlobe className="w-5 h-5 text-blue-600 mr-3" />;
            case 'trello':
              return <FaGlobe className="w-5 h-5 text-blue-400 mr-3" />;
            default:
              return <FaGlobe className="w-5 h-5 text-gray-400 mr-3" />;
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-blue-600" />
              Contact Information
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Basic Contacts */}
              <h3 className="font-semibold text-gray-800 mb-2">Basic Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  {basicCol1.map((item: typeof basicContacts[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      {item.isLink ? (
                        <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-gray-600">{item.label}</span>
                      )}
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {basicCol2.map((item: typeof basicContacts[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      {item.isLink ? (
                        <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-gray-600">{item.label}</span>
                      )}
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Social Links */}
              <h3 className="font-semibold text-gray-800 mb-2">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  {socialCol1.map((item: typeof socialProfiles[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      <span className="text-gray-600 mr-1">{item.network}:</span>
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.username}
                      </a>
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {socialCol2.map((item: typeof socialProfiles[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      <span className="text-gray-600 mr-1">{item.network}:</span>
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.username}
                      </a>
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
              </div>
              {/* My Tools */}
              <h3 className="font-semibold text-gray-800 mb-2">My Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {toolCol1.map((item: typeof toolProfiles[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      <span className="text-gray-600 mr-1">{item.name}:</span>
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.username}
                      </a>
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {toolCol2.map((item: typeof toolProfiles[number], idx: number) => (
                    <div key={idx} className="flex items-center">
                      {item.icon}
                      <span className="text-gray-600 mr-1">{item.name}:</span>
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.username}
                      </a>
                      <CopyButton text={item.value} className="ml-1" />
                    </div>
                  ))}
                </div>
              </div>
              {cvData.contacts?.customFields && cvData.contacts.customFields.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <h3 className="font-semibold text-gray-800 col-span-full">Additional Contact Info</h3>
                  {cvData.contacts.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
                      <div className="flex-1">
                        <CustomFieldRenderer field={field} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'work':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
              Work Experience
            </h2>
            <div className="space-y-6">
              {cvData.work.map((job, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{job.position}</h3>
                        <CopyButton text={job.position} className="ml-1" />
                      </div>
                      <div className="flex items-center mb-2">
                        <p className="text-blue-600 font-medium">{job.name}</p>
                        <CopyButton text={job.name} className="ml-1" />
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{job.location}</span>
                        <CopyButton text={job.location} className="ml-1" />
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{job.startDate} - {job.endDate || 'Present'}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({calculateDuration(job.startDate, job.endDate)})
                        </span>
                        <CopyButton text={`${job.startDate} - ${job.endDate || 'Present'}`} className="ml-1" />
                      </div>
                      {job.jobType && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <span className="font-medium">Job Type:</span>
                          <span className="ml-2">{job.jobType}</span>
                          <CopyButton text={job.jobType} className="ml-1" />
                        </div>
                      )}
                      {job.employeeType && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <span className="font-medium">Employee Type:</span>
                          <span className="ml-2">{job.employeeType}</span>
                          <CopyButton text={job.employeeType} className="ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {job.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700 flex-1">{highlight}</span>
                        <CopyButton text={highlight} className="ml-1" />
                      </li>
                    ))}
                  </ul>

                  {job.customFields && job.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {job.customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
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
          </section>
        );

      case 'education':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
              Education
            </h2>
            <div className="space-y-6">
              {cvData.education.map((edu, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{edu.studyType} in {edu.area}</h3>
                    <CopyButton text={`${edu.studyType} in ${edu.area}`} className="ml-1" />
                  </div>
                  <div className="flex items-center mb-2">
                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                    <CopyButton text={edu.institution} className="ml-1" />
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{edu.startDate} - {edu.endDate}</span>
                    <CopyButton text={`${edu.startDate} - ${edu.endDate}`} className="ml-1" />
                  </div>
                  {edu.score && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Score:</span>
                      <span className="ml-2">{edu.cgpa && edu.scale ? `CGPA: ${edu.cgpa}/${edu.scale}` : edu.score}</span>
                      <CopyButton text={edu.cgpa && edu.scale ? `CGPA: ${edu.cgpa}/${edu.scale}` : edu.score} className="ml-1" />
                    </div>
                  )}

                  {edu.customFields && edu.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {edu.customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
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
          </section>
        );

      case 'skills':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-blue-600" />
              Skills
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {cvData.skills.technical.map((skillGroup, index) => (
                  <div key={index}>
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{skillGroup.name}</h3>
                      <CopyButton text={skillGroup.name} className="ml-1" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.keywords.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                          <CopyButton text={skill} className="ml-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {cvData.skills.methodologies.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Methodologies</h3>
                      <CopyButton text="Methodologies" className="ml-1" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.methodologies.map((methodology, index) => (
                        <div key={index} className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {methodology}
                          </span>
                          <CopyButton text={methodology} className="ml-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cvData.skills?.customFields && cvData.skills.customFields.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cvData.skills.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
                      <div className="flex-1">
                        <CustomFieldRenderer field={field} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'projects':
        if (!cvData.projects || cvData.projects.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Projects
            </h2>
            <div className="space-y-6">
              {cvData.projects.map((project, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                    <CopyButton text={project.name} className="ml-1" />
                  </div>
                  {project.description && (
                    <div className="flex items-center mb-2">
                      <p className="text-gray-600">{project.description}</p>
                      <CopyButton text={project.description} className="ml-1" />
                    </div>
                  )}
                  {project.url && (
                    <div className="flex items-center mb-2">
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {project.url}
                      </a>
                      <CopyButton text={project.url} className="ml-1" />
                    </div>
                  )}

                  {project.customFields && project.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
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
          </section>
        );

      case 'certificates':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-blue-600" />
              Certificates
            </h2>
            <div className="space-y-4">
              {cvData.certificates.map((cert, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                    <CopyButton text={cert.name} className="ml-1" />
                  </div>
                  <div className="flex items-center mb-2">
                    <p className="text-blue-600 font-medium">{cert.issuer}</p>
                    <CopyButton text={cert.issuer} className="ml-1" />
                  </div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-1 text-gray-600" />
                    <span className="text-gray-600">{cert.date}</span>
                    <CopyButton text={cert.date} className="ml-1" />
                  </div>
                  {cert.url && (
                    <div className="flex items-center">
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Certificate
                      </a>
                      <CopyButton text={cert.url} className="ml-1" />
                    </div>
                  )}

                  {cert.customFields && cert.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cert.customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
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
          </section>
        );

      case 'languages':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600" />
              Languages
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{lang.language}</span>
                      <span className="text-gray-600 ml-2">({lang.fluency})</span>
                    </div>
                    <CopyButton text={`${lang.language} - ${lang.fluency}`} />
                  </div>
                ))}
              </div>

              {cvData.languages?.[0]?.customFields && cvData.languages[0].customFields.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cvData.languages[0].customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
                      <div className="flex-1">
                        <CustomFieldRenderer field={field} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'coverLetters':
        if (!cvData.coverLetters || cvData.coverLetters.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Cover Letters
            </h2>
            <div className="space-y-6">
              {cvData.coverLetters.map((coverLetter, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{coverLetter.title}</h3>
                    <CopyButton text={coverLetter.title} className="ml-1" />
                  </div>
                  <div className="flex items-start">
                    <p className="text-gray-700 whitespace-pre-wrap flex-1">{coverLetter.content}</p>
                    <CopyButton text={coverLetter.content} className="ml-1" />
                  </div>

                  {coverLetter.customFields && coverLetter.customFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coverLetter.customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg break-inside-avoid overflow-hidden break-words">
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
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold text-gray-800">Rony.DB</div>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={downloadAsJSON}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download as JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Render sections based on tab order */}
        {tabOrder.map((sectionName) => renderSection(sectionName))}
        
        {/* Render custom tabs */}
        {customTabs.map((tab) => renderCustomTab(tab))}
      </div>
    </div>
  );
};
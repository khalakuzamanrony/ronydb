import React, { useState, useEffect, useRef } from "react";
import BackupRestore from "./BackupRestore";
import EmailManager from "./EmailManager";
import { supabase } from "../utils/supabaseClient";
import { 
  startDevToolsProtection, 
  showConsoleWarning, 
  setDevToolsProtectionEnabled, 
  isDevToolsProtectionEnabled, 
  initializeDevToolsProtection 
} from "../utils/devToolsProtection";
import { testEncryption, decryptUserData } from "../utils/encryption";
import {
  LogOut,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Edit,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Hash,
  Layers,
  ExternalLink,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldOff,
} from "lucide-react";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaReddit,
  FaDiscord,
  FaSnapchatGhost,
  FaPinterest,
  FaMedium,
  FaDribbble,
  FaBehance,
  FaStackOverflow,
  FaFacebookMessenger,
  FaGlobe,
} from "react-icons/fa";
import {
  getCVData,
  saveCVData,
  fetchCVDataFromSupabase,
} from "../utils/cvData";
import { CVData, CustomTab, CustomField } from "../types/cv";
import FileUpload from "./FileUpload";
import DragDropList from "./DragDropList";
import Select from "react-select";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";
import CustomFieldRow from "./CustomFieldRow";

interface DashboardProps {
  onLogout: () => void;
  onDataChange?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onDataChange }) => {
  // State for current user info
  const [currentUser, setCurrentUser] = useState<{name: string, email: string, role: string} | null>(null);

  // Load current user info
  const loadCurrentUser = async () => {
    try {
      const userEmail = localStorage.getItem('current_user_email');
      if (userEmail) {
        // Get all encrypted records and find matching email
        const { data: allRecords, error } = await supabase
          .from('allowed_emails')
          .select('email, name, role');

        if (error) {
          console.error('Failed to load user records:', error);
          return;
        }

        if (!allRecords || allRecords.length === 0) {
          return;
        }

        // Find matching user by decrypting emails
        for (const record of allRecords) {
          try {
            const decryptedData = decryptUserData(record);
            // console.log('Checking user record for:', userEmail.toLowerCase());
            // console.log('Decrypted email:', decryptedData?.email);
            
            if (decryptedData && decryptedData.email && decryptedData.email === userEmail.toLowerCase()) {
              setCurrentUser({
                name: decryptedData.name || 'Unknown User',
                email: decryptedData.email,
                role: decryptedData.role || 'user'
              });
              // console.log('User found and set:', decryptedData.email);
              return;
            }
          } catch (decryptError) {
            console.error('Error decrypting user record:', decryptError);
          }
        }
        console.log('No matching user found for:', userEmail);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // All hooks at the top
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basics");
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  let saveTimeout: any = null;
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<{[key: string]: boolean}>({});
  const [expandedAcademicEntries, setExpandedAcademicEntries] = useState<Record<string, boolean>>({});
  const [devToolsProtectionEnabled, setDevToolsProtectionEnabledState] = useState(true);

  // Function to toggle password visibility
  const togglePasswordVisibility = (vendorIndex: number, accountIndex: number) => {
    const key = `${vendorIndex}-${accountIndex}`;
    setPasswordVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: "Copied to clipboard!", type: "success" });
  };

  // Toggle dev tools protection
  const toggleDevToolsProtection = () => {
    const newState = !devToolsProtectionEnabled;
    setDevToolsProtectionEnabled(newState);
    setDevToolsProtectionEnabledState(newState);
    setToast({ 
      message: `Dev Tools Security ${newState ? 'Enabled' : 'Disabled'}`, 
      type: "success" 
    });
  };

  useEffect(() => {
    document.title = "Dashboard | Rony.DB";
    loadCurrentUser();
    
    // Initialize security protection
    initializeDevToolsProtection();
    setDevToolsProtectionEnabledState(isDevToolsProtectionEnabled());
  }, []);

  useEffect(() => {
    (async () => {
      const supabaseData = await fetchCVDataFromSupabase();
      // One-time fix: ensure 'projects', 'passwordBank', 'academic', and 'backup-restore' are in tabOrder for this session only
      if (supabaseData && Array.isArray(supabaseData.tabOrder)) {
        const updatedTabOrder = [...supabaseData.tabOrder];
        let needsUpdate = false;
        
        if (!updatedTabOrder.includes('projects')) {
          updatedTabOrder.push('projects');
          needsUpdate = true;
        }
        
        if (!updatedTabOrder.includes('passwordBank')) {
          updatedTabOrder.push('passwordBank');
          needsUpdate = true;
        }
        
        if (!updatedTabOrder.includes('academic')) {
          // Add academic tab after education tab for better organization
          const educationIndex = updatedTabOrder.indexOf('education');
          if (educationIndex !== -1) {
            updatedTabOrder.splice(educationIndex + 1, 0, 'academic');
          } else {
            updatedTabOrder.push('academic');
          }
          needsUpdate = true;
        }
        
        if (!updatedTabOrder.includes('backup-restore')) {
          updatedTabOrder.push('backup-restore');
          needsUpdate = true;
        }
        
        if (!updatedTabOrder.includes('email-manager')) {
          updatedTabOrder.push('email-manager');
          needsUpdate = true;
        }
        
        // Initialize passwordBank if it doesn't exist
        if (!supabaseData.passwordBank) {
          supabaseData.passwordBank = [];
          needsUpdate = true;
        }
        
        // Initialize academic if it doesn't exist
        if (!supabaseData.academic) {
          supabaseData.academic = [];
          needsUpdate = true;
        }
        
        // Initialize tabVisibility if it doesn't exist
        if (!supabaseData.tabVisibility) {
          supabaseData.tabVisibility = {
            basics: true,
            contacts: true,
            work: true,
            education: true,
            academic: true,
            skills: true,
            projects: true,
            certificates: true,
            languages: true,
            coverLetters: true,
            passwordBank: true,
            'backup-restore': true,
            'email-manager': true
          };
          needsUpdate = true;
        }

        // Initialize customFieldsVisibility if it doesn't exist
        if (!supabaseData.customFieldsVisibility) {
          supabaseData.customFieldsVisibility = {
            basics: true,
            contacts: true,
            work: true,
            education: true,
            academic: true,
            skills: true,
            projects: true,
            certificates: true,
            languages: true,
            tools: true,
            passwordBank: true
          };
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          setCvData({ ...supabaseData, tabOrder: updatedTabOrder });
        } else {
          setCvData(supabaseData);
        }
      } else {
        setCvData(supabaseData);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!cvData) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      handleSave();
    }, 500);
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [cvData]);

  // Immediately after hooks, do the loading/null check
  if (loading || !cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  // Now it's safe to use cvData in variables, arrays, etc.
  const handleSave = () => {
    if (!cvData) return;
    saveCVData(cvData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    if (onDataChange) onDataChange();
  };

  // Reusable toggle component for custom fields visibility
  const CustomFieldsToggle = ({ sectionId, label }: { sectionId: string; label?: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-text">{label || "Show on Homepage"}:</span>
      <button
        onClick={() => {
          setCvData({
            ...cvData!,
            customFieldsVisibility: {
              ...cvData!.customFieldsVisibility,
              [sectionId]: !cvData!.customFieldsVisibility?.[sectionId]
            }
          });
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          cvData!.customFieldsVisibility?.[sectionId] ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            cvData!.customFieldsVisibility?.[sectionId] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const addNewTab = () => {
    const newTab: CustomTab = {
      id: Date.now().toString(),
      name: "New Tab",
      customFields: [],
    };
    setCvData({
      ...cvData!,
      customTabs: [...cvData!.customTabs, newTab],
      tabOrder: [...cvData!.tabOrder, newTab.id],
    });
  };

  const updateCustomTab = (tabId: string, updates: Partial<CustomTab>) => {
    setCvData({
      ...cvData!,
      customTabs: cvData!.customTabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      ),
    });
  };

  const deleteCustomTab = (tabId: string) => {
    setCvData({
      ...cvData!,
      customTabs: cvData!.customTabs.filter((tab) => tab.id !== tabId),
      tabOrder: cvData!.tabOrder.filter((id) => id !== tabId),
    });
  };

  const toolOptions = [
    {
      value: "VSCode",
      label: "VSCode",
      icon: <FaGithub className="w-4 h-4 inline mr-1 text-blue-600" />,
    },
    {
      value: "GitHub",
      label: "GitHub",
      icon: <FaGithub className="w-4 h-4 inline mr-1 text-gray-800" />,
    },
    {
      value: "Figma",
      label: "Figma",
      icon: <FaDribbble className="w-4 h-4 inline mr-1 text-pink-400" />,
    },
    {
      value: "Notion",
      label: "Notion",
      icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" />,
    },
    {
      value: "Slack",
      label: "Slack",
      icon: <FaDiscord className="w-4 h-4 inline mr-1 text-indigo-500" />,
    },
    {
      value: "Jira",
      label: "Jira",
      icon: <FaGlobe className="w-4 h-4 inline mr-1 text-blue-600" />,
    },
    {
      value: "Trello",
      label: "Trello",
      icon: <FaGlobe className="w-4 h-4 inline mr-1 text-blue-400" />,
    },
    {
      value: "Other",
      label: "Other",
      icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" />,
    },
  ];

  // Now it's safe to use cvData, including in the tabs array
  // Build tabs array from tabOrder, mapping ids to built-in and custom tabs
  const builtInTabs = [
    { id: "basics", label: "Basic Info" },
    { id: "contacts", label: "Contacts" },
    { id: "tools", label: "My Tools" },
    { id: "work", label: "Work Experience" },
    { id: "education", label: "Education" },
    { id: "academic", label: "Academic" },
    { id: "skills", label: "Skills" },
    { id: "certificates", label: "Certificates" },
    { id: "languages", label: "Languages" },
    { id: "coverLetters", label: "Cover Letters" },
    { id: "projects", label: "Projects" },
    { id: "passwordBank", label: "Password Bank" },
    { id: "backup-restore", label: "Backup-Restore" },
    { id: "email-manager", label: "Email Manager" },
  ];
  const customTabsMap = Object.fromEntries(
    cvData.customTabs.map((tab) => [tab.id, tab])
  );
  const tabs = cvData.tabOrder.map((id) => {
    const builtIn = builtInTabs.find((t) => t.id === id);
    if (builtIn) return builtIn;
    const custom = customTabsMap[id];
    if (custom) return { id: custom.id, label: custom.name };
    return { id, label: id };
  });

  const reorderTabs = (newOrder: string[]) => {
    setCvData((cvData) => {
      if (!cvData) return cvData;
      const updated = { ...cvData, tabOrder: newOrder };
      // Auto-save after reordering
      saveCVData(updated);
      if (onDataChange) onDataChange();
      return updated;
    });
  };

  const renderBasicsTab = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Name
          </label>
          <input
            type="text"
            value={cvData.basics.name}
            onChange={(e) =>
              setCvData({
                ...cvData!,
                basics: { ...cvData!.basics, name: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Label
          </label>
          <input
            type="text"
            value={cvData.basics.label}
            onChange={(e) =>
              setCvData({
                ...cvData!,
                basics: { ...cvData!.basics, label: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
          />
        </div>
      </div>
      
      <FileUpload
        label="Profile Image"
        value={cvData.basics.image}
        onChange={(value, file) =>
          setCvData({
            ...cvData!,
            basics: { ...cvData!.basics, image: value, imageFile: file },
          })
        }
        accept="image/*"
        type="image"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUpload
          label="Resume"
          value={cvData.basics.resume || ''}
          onChange={(value, file) => setCvData({...cvData!, basics: {...cvData!.basics, resume: value, resumeFile: file}})}
          accept=".pdf,.doc,.docx"
        />
        <FileUpload
          label="Google Sheet DB"
          value={cvData.basics.googleSheetDb || ''}
          onChange={(value) => setCvData({...cvData!, basics: {...cvData!.basics, googleSheetDb: value}})}
          accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.google-apps.spreadsheet"
          hideUploadButton={true}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Summary
        </label>
        <textarea
          value={cvData.basics.summary}
          onChange={(e) =>
            setCvData({
              ...cvData!,
              basics: { ...cvData!.basics, summary: e.target.value },
            })
          }
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUpload
          label="Latest Manual Backup"
          value={cvData.basics.latestManualBackup || ''}
          onChange={(value, file) => setCvData({...cvData!, basics: {...cvData!.basics, latestManualBackup: value, latestManualBackupFile: file}})}          
          accept=".json"
        />
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Key
          </label>
          <input
            type="text"
            value={cvData.basics.key || ''}
            onChange={(e) =>
              setCvData({
                ...cvData!,
                basics: { ...cvData!.basics, key: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
          />
        </div>
      </div>
      
      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-lg font-semibold text-text">Custom Fields</label>
          <CustomFieldsToggle sectionId="basics" />
        </div>
        <DragDropList
          items={cvData.basics.customFields}
          onReorder={newOrder => setCvData({
            ...cvData!,
            basics: { ...cvData!.basics, customFields: newOrder }
          })}
          renderItem={(field: CustomField, index: number) => (
            <CustomFieldRow
              key={field.id}
              field={field}
              onChange={updates => {
                const newFields = [...cvData.basics.customFields];
                newFields[index] = { ...field, ...updates } as CustomField;
                setCvData({ ...cvData!, basics: { ...cvData!.basics, customFields: newFields } });
              }}
              onDelete={() => {
                const newFields = cvData.basics.customFields.filter((_: any, i: number) => i !== index);
                setCvData({ ...cvData!, basics: { ...cvData!.basics, customFields: newFields } });
              }}
              index={index}
              showDragHandle={true}
            />
          )}
        />
        <button
          onClick={() => {
            const newFields = [
              ...cvData.basics.customFields,
              { id: Date.now().toString(), type: 'text' as const, label: '', value: '', order: cvData.basics.customFields.length }
            ];
            setCvData({ ...cvData!, basics: { ...cvData!.basics, customFields: newFields } });
          }}
          className="w-full mt-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add Custom Field
        </button>
      </div>
    </div>
  );

  const renderContactsTab = () => {
    // Social network options with icons
    const socialNetworks = [
      {
        value: "LinkedIn",
        label: "LinkedIn",
        icon: <FaLinkedin className="w-4 h-4 inline mr-1 text-blue-600" />,
      },
      {
        value: "GitHub",
        label: "GitHub",
        icon: <FaGithub className="w-4 h-4 inline mr-1 text-gray-800" />,
      },
      {
        value: "Twitter",
        label: "Twitter",
        icon: <FaTwitter className="w-4 h-4 inline mr-1 text-blue-400" />,
      },
      {
        value: "Facebook",
        label: "Facebook",
        icon: <FaFacebook className="w-4 h-4 inline mr-1 text-blue-700" />,
      },
      {
        value: "Messenger",
        label: "Messenger",
        icon: (
          <FaFacebookMessenger className="w-4 h-4 inline mr-1 text-blue-500" />
        ),
      },
      {
        value: "Instagram",
        label: "Instagram",
        icon: <FaInstagram className="w-4 h-4 inline mr-1 text-pink-500" />,
      },
      {
        value: "YouTube",
        label: "YouTube",
        icon: <FaYoutube className="w-4 h-4 inline mr-1 text-red-600" />,
      },
      {
        value: "TikTok",
        label: "TikTok",
        icon: <FaTiktok className="w-4 h-4 inline mr-1 text-black" />,
      },
      {
        value: "WhatsApp",
        label: "WhatsApp",
        icon: <FaWhatsapp className="w-4 h-4 inline mr-1 text-green-500" />,
      },
      {
        value: "Telegram",
        label: "Telegram",
        icon: <FaTelegram className="w-4 h-4 inline mr-1 text-blue-400" />,
      },
      {
        value: "Reddit",
        label: "Reddit",
        icon: <FaReddit className="w-4 h-4 inline mr-1 text-orange-500" />,
      },
      {
        value: "Discord",
        label: "Discord",
        icon: <FaDiscord className="w-4 h-4 inline mr-1 text-indigo-500" />,
      },
      {
        value: "Snapchat",
        label: "Snapchat",
        icon: (
          <FaSnapchatGhost className="w-4 h-4 inline mr-1 text-yellow-400" />
        ),
      },
      {
        value: "Pinterest",
        label: "Pinterest",
        icon: <FaPinterest className="w-4 h-4 inline mr-1 text-red-500" />,
      },
      {
        value: "Medium",
        label: "Medium",
        icon: <FaMedium className="w-4 h-4 inline mr-1 text-green-700" />,
      },
      {
        value: "Dribbble",
        label: "Dribbble",
        icon: <FaDribbble className="w-4 h-4 inline mr-1 text-pink-400" />,
      },
      {
        value: "Behance",
        label: "Behance",
        icon: <FaBehance className="w-4 h-4 inline mr-1 text-blue-500" />,
      },
      {
        value: "Stack Overflow",
        label: "Stack Overflow",
        icon: (
          <FaStackOverflow className="w-4 h-4 inline mr-1 text-orange-400" />
        ),
      },
      {
        value: "Other",
        label: "Other",
        icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" />,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={cvData.contacts.email}
              onChange={(e) =>
                setCvData({
                  ...cvData!,
                  contacts: { ...cvData!.contacts, email: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Phone
            </label>
            <input
              type="text"
              value={cvData.contacts.phone}
              onChange={(e) =>
                setCvData({
                  ...cvData!,
                  contacts: { ...cvData!.contacts, phone: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={cvData.contacts.url}
              onChange={(e) =>
                setCvData({
                  ...cvData!,
                  contacts: { ...cvData!.contacts, url: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              City
            </label>
            <input
              type="text"
              value={cvData.contacts.location.city}
              onChange={(e) =>
                setCvData({
                  ...cvData!,
                  contacts: {
                    ...cvData!.contacts,
                    location: {
                      ...cvData!.contacts.location,
                      city: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Country
            </label>
            <input
              type="text"
              value={cvData.contacts.location.country}
              onChange={(e) =>
                setCvData({
                  ...cvData!,
                  contacts: {
                    ...cvData!.contacts,
                    location: {
                      ...cvData!.contacts.location,
                      country: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text">Social Profiles</h3>
            <button
              onClick={() => {
                const newProfile = { network: "", username: "", url: "" };
                setCvData({
                  ...cvData!,
                  contacts: {
                    ...cvData!.contacts,
                    profiles: [newProfile, ...cvData!.contacts.profiles],
                  },
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
          </div>
          
          <DragDropList
            items={cvData.contacts.profiles}
            onReorder={(newOrder) =>
              setCvData({
                ...cvData!,
                contacts: { ...cvData!.contacts, profiles: newOrder },
              })
            }
            renderItem={(profile, index) => (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Select
                    classNamePrefix="react-select"
                    value={
                      socialNetworks.find((n) => n.value === profile.network) ||
                      null
                    }
                    onChange={(selected) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = {
                        ...profile,
                        network: selected ? selected.value : "",
                      };
                      setCvData({
                        ...cvData!,
                        contacts: {
                          ...cvData!.contacts,
                          profiles: newProfiles,
                        },
                      });
                    }}
                    options={socialNetworks}
                    isClearable
                    placeholder="Network"
                    formatOptionLabel={(option) => (
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-1">{option.label}</span>
                      </div>
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "38px",
                        backgroundColor: "var(--color-row)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text)",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px var(--color-primary)"
                          : base.boxShadow,
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--color-text)",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--color-text)",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        backgroundColor: "var(--color-row)",
                        color: "var(--color-text)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "var(--color-primary)"
                          : state.isFocused
                          ? "var(--color-section-header)"
                          : "var(--color-row)",
                        color: state.isSelected
                          ? "var(--color-bg)"
                          : "var(--color-text)",
                      }),
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = {
                        ...profile,
                        username: e.target.value,
                      };
                      setCvData({
                        ...cvData!,
                        contacts: {
                          ...cvData!.contacts,
                          profiles: newProfiles,
                        },
                      });
                    }}
                    placeholder="Username"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    value={profile.url}
                    onChange={(e) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = { ...profile, url: e.target.value };
                      setCvData({
                        ...cvData!,
                        contacts: {
                          ...cvData!.contacts,
                          profiles: newProfiles,
                        },
                      });
                    }}
                    placeholder="Profile URL"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                  />
                </div>
                <button
                  onClick={() => {
                    const newProfiles = cvData.contacts.profiles.filter(
                      (_, i) => i !== index
                    );
                    setCvData({
                      ...cvData!,
                      contacts: { ...cvData!.contacts, profiles: newProfiles },
                    });
                  }}
                  className="ml-2 md:mt-2 text-red-600 hover:text-red-800"
                  title="Delete profile"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          />
        </div>

        {/* My Tools section in Contacts */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text">My Tools</h3>
            <button
              onClick={() => {
                const newTool = {
                  name: "",
                  username: "",
                  url: "",
                  customFields: [],
                };
                setCvData({
                  ...cvData!,
                  tools: [newTool, ...(cvData!.tools || [])],
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          </div>
          <DragDropList
            items={cvData.tools || []}
            onReorder={(newOrder) => setCvData({ ...cvData!, tools: newOrder })}
            renderItem={(tool, index) => (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Select
                    classNamePrefix="react-select"
                    value={
                      toolOptions.find((n) => n.value === tool.name) || null
                    }
                    onChange={(selected) => {
                      const newTools = [...cvData.tools];
                      newTools[index] = {
                        ...tool,
                        name: selected ? selected.value : "",
                      };
                      setCvData({ ...cvData!, tools: newTools });
                    }}
                    options={toolOptions}
                    isClearable
                    placeholder="Tool Name"
                    formatOptionLabel={(option) => (
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-1">{option.label}</span>
                      </div>
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "38px",
                        backgroundColor: "var(--color-row)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text)",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px var(--color-primary)"
                          : base.boxShadow,
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--color-text)",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--color-text)",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        backgroundColor: "var(--color-row)",
                        color: "var(--color-text)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "var(--color-primary)"
                          : state.isFocused
                          ? "var(--color-section-header)"
                          : "var(--color-row)",
                        color: state.isSelected
                          ? "var(--color-bg)"
                          : "var(--color-text)",
                      }),
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={tool.username}
                    onChange={(e) => {
                      const newTools = [...cvData.tools];
                      newTools[index] = { ...tool, username: e.target.value };
                      setCvData({ ...cvData!, tools: newTools });
                    }}
                    placeholder="Username"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    value={tool.url}
                    onChange={(e) => {
                      const newTools = [...cvData.tools];
                      newTools[index] = { ...tool, url: e.target.value };
                      setCvData({ ...cvData!, tools: newTools });
                    }}
                    placeholder="Tool URL"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                  />
                </div>
                <button
                  onClick={() => {
                    const newTools = cvData.tools.filter((_: any, i: number) => i !== index);
                    setCvData({ ...cvData!, tools: newTools });
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="Delete tool"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          />
        </div>


      </div>
    );
  };

  // Work Experience Tab
  const renderWorkTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Work Experience</h3>
        <button
          onClick={() => {
            const newJob = {
              id: Date.now().toString(),
              name: "",
              position: "",
              location: "",
              startDate: "",
              endDate: "",
              url: "",
              jobType: "",
              employeeType: "",
              highlights: [],
              customFields: [],
            };
            setCvData({
              ...cvData!,
              work: [newJob, ...cvData!.work],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>
      <DragDropList
        items={cvData.work}
        onReorder={(newOrder) => setCvData({ ...cvData!, work: newOrder })}
        renderItem={(job, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-text">Job #{index + 1}</h4>
              <button
                onClick={() => {
                  const newJobs = cvData.work.filter((_: any, i: number) => i !== index);
                  setCvData({ ...cvData!, work: newJobs });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Company Name</label>
                <input
                  type="text"
                  value={job.name}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, name: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Position</label>
                <input
                  type="text"
                  value={job.position}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, position: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Location</label>
                <input
                  type="text"
                  value={job.location}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, location: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Start Date</label>
                <input
                  type="text"
                  value={job.startDate}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, startDate: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">End Date</label>
                <input
                  type="text"
                  value={job.endDate}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, endDate: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Company URL</label>
                <input
                  type="url"
                  value={job.url}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, url: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Job Type</label>
                <input
                  type="text"
                  value={job.jobType}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, jobType: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Employee Type</label>
                <input
                  type="text"
                  value={job.employeeType}
                  onChange={e => {
                    const newJobs = [...cvData.work];
                    newJobs[index] = { ...job, employeeType: e.target.value };
                    setCvData({ ...cvData!, work: newJobs });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-text">Highlights</h3>
              </div>
              <DragDropList
                items={job.highlights}
                onReorder={newOrder => {
                  const newJobs = [...cvData.work];
                  newJobs[index] = { ...job, highlights: newOrder };
                  setCvData({ ...cvData!, work: newJobs });
                }}
                renderItem={(highlight, hIndex) => (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={e => {
                        const newHighlights = [...job.highlights];
                        newHighlights[hIndex] = e.target.value;
                        const newJobs = [...cvData.work];
                        newJobs[index] = { ...job, highlights: newHighlights };
                        setCvData({ ...cvData!, work: newJobs });
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                    />
                    <button
                      onClick={() => {
                        const newHighlights = job.highlights.filter((_: any, i: number) => i !== hIndex);
                        const newJobs = [...cvData.work];
                        newJobs[index] = { ...job, highlights: newHighlights };
                        setCvData({ ...cvData!, work: newJobs });
                      }}
                      className="ml-2 text-red-600 hover:text-red-800"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              />
              <button
                onClick={() => {
                  const newJobs = [...cvData.work];
                  const newHighlights = [...job.highlights, ""];
                  newJobs[index] = { ...job, highlights: newHighlights };
                  setCvData({ ...cvData!, work: newJobs });
                }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs mt-2 w-full justify-center"
              >
                <Plus className="w-3 h-3" />
                Add Highlight
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );

  // Academic Tab
  const renderAcademicTab = () => {
    // Toggle expansion state for an entry
    const toggleExpansion = (id: string) => {
      setExpandedAcademicEntries(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text">Academic</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text">Show on Homepage:</span>
              <button
                onClick={() => {
                  setCvData({
                    ...cvData!,
                    tabVisibility: {
                      ...cvData!.tabVisibility,
                      academic: !cvData!.tabVisibility?.academic
                    }
                  });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  cvData!.tabVisibility?.academic ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cvData!.tabVisibility?.academic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => {
                const newAcademic = {
                  id: Date.now().toString(),
                  title: `Academic Entry #${cvData.academic.length + 1}`,
                  degreeName: "",
                  instituteName: "",
                  instituteCode: "",
                  group: "",
                  session: "",
                  examYear: "",
                  level: "",
                  board: "",
                  rollNumber: "",
                  registrationNumber: "",
                  dateOfBirth: "",
                  gender: "",
                  name: "",
                  fatherName: "",
                  motherName: "",
                  gpa: "",
                  files: [],
                  customFields: [],
                };
                setCvData({
                  ...cvData!,
                  academic: [newAcademic, ...cvData!.academic],
                });
                // Auto-expand the newly added entry
                setExpandedAcademicEntries(prev => ({
                  ...prev,
                  [newAcademic.id]: true
                }));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Academic Entry
            </button>
          </div>
        </div>
        <DragDropList
          items={cvData.academic}
          onReorder={(newOrder) => setCvData({ ...cvData!, academic: newOrder })}
          renderItem={(academic, index) => (
            <div className="bg-sectionheader p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-grow">
                  <button
                    onClick={() => toggleExpansion(academic.id)}
                    className="text-text hover:text-blue-500"
                    aria-label={expandedAcademicEntries[academic.id] ? "Collapse" : "Expand"}
                  >
                    {expandedAcademicEntries[academic.id] ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={academic.title || `Academic Entry #${index + 1}`}
                    onChange={e => {
                      const newAcademic = [...cvData.academic];
                      newAcademic[index] = { ...academic, title: e.target.value };
                      setCvData({ ...cvData!, academic: newAcademic });
                    }}
                    className="font-medium text-text bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-grow"
                    placeholder={`Academic Entry #${index + 1}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newAcademic = cvData.academic.filter((_: any, i: number) => i !== index);
                      setCvData({ ...cvData!, academic: newAcademic });
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {expandedAcademicEntries[academic.id] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Degree Name</label>
                        {academic.degreeName && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.degreeName);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy degree name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.degreeName}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, degreeName: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Institute Name</label>
                        {academic.instituteName && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.instituteName);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy institute name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.instituteName}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, instituteName: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Institute Code</label>
                        {academic.instituteCode && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.instituteCode);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy institute code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.instituteCode}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, instituteCode: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Group</label>
                        {academic.group && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.group);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy group"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.group}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, group: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Session</label>
                        {academic.session && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.session);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy session"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.session}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, session: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Exam Year</label>
                        {academic.examYear && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.examYear);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy exam year"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.examYear}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, examYear: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Level</label>
                        {academic.level && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.level);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy level"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.level}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, level: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Board</label>
                        {academic.board && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.board);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy board"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.board}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, board: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Roll Number</label>
                        {academic.rollNumber && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.rollNumber);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy roll number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.rollNumber}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, rollNumber: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Registration Number</label>
                        {academic.registrationNumber && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.registrationNumber);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy registration number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.registrationNumber}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, registrationNumber: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Date of Birth</label>
                        {academic.dateOfBirth && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.dateOfBirth);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy date of birth"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.dateOfBirth}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, dateOfBirth: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Gender</label>
                        {academic.gender && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.gender);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy gender"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.gender}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, gender: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Name</label>
                        {academic.name && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.name);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.name}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, name: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Father's Name</label>
                        {academic.fatherName && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.fatherName);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy father's name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.fatherName}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, fatherName: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">Mother's Name</label>
                        {academic.motherName && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.motherName);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy mother's name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.motherName}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, motherName: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text">GPA</label>
                        {academic.gpa && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(academic.gpa);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy GPA"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={academic.gpa}
                        onChange={e => {
                          const newAcademic = [...cvData.academic];
                          newAcademic[index] = { ...academic, gpa: e.target.value };
                          setCvData({ ...cvData!, academic: newAcademic });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                  </div>
                  
                  {/* File Upload Section */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-semibold text-text">Files</h3>
                    </div>
                    
                    {/* Display existing files */}
                    {academic.files && academic.files.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {academic.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center justify-between bg-row p-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-text">{file.name}</span>
                              <input
                                type="text"
                                value={file.label || ''}
                                onChange={e => {
                                  const newAcademic = [...cvData.academic];
                                  const newFiles = [...academic.files];
                                  newFiles[fileIndex] = { ...file, label: e.target.value };
                                  newAcademic[index] = { ...academic, files: newFiles };
                                  setCvData({ ...cvData!, academic: newAcademic });
                                }}
                                placeholder="Add label"
                                className="ml-2 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.url && (
                                <>
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                    title="View file"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  <a 
                                    href={file.url} 
                                    download={file.name}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(file.url);
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Copy link"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  const newAcademic = [...cvData.academic];
                                  const newFiles = [...academic.files];
                                  newFiles.splice(fileIndex, 1);
                                  newAcademic[index] = { ...academic, files: newFiles };
                                  setCvData({ ...cvData!, academic: newAcademic });
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add new file */}
                    <div className="space-y-2">
                      <FileUpload
                        label="Add File"
                        value=""
                        onChange={(value, file) => {
                          if (value && file) {
                            const newAcademic = [...cvData.academic];
                            const newFiles = [...(academic.files || [])];
                            newFiles.push({
                              name: file.name,
                              url: value,
                              label: "",
                              file: file
                            });
                            newAcademic[index] = { ...academic, files: newFiles };
                            setCvData({ ...cvData!, academic: newAcademic });
                          }
                        }}
                        accept="*/*"
                      />
                      <p className="text-xs text-gray-500">You can add a label to each file after uploading</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        />
      </div>
    );
  };
  
  // Education Tab
  const renderEducationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Education</h3>
        <button
          onClick={() => {
            const newEdu = {
              id: Date.now().toString(),
              institution: "",
              area: "",
              studyType: "",
              startDate: "",
              endDate: "",
              score: "",
              cgpa: "",
              scale: "",
              customFields: [],
            };
            setCvData({
              ...cvData!,
              education: [newEdu, ...cvData!.education],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
      <DragDropList
        items={cvData.education}
        onReorder={(newOrder) => setCvData({ ...cvData!, education: newOrder })}
        renderItem={(edu, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-text">Education #{index + 1}</h4>
              <button
                onClick={() => {
                  const newEdu = cvData.education.filter((_: any, i: number) => i !== index);
                  setCvData({ ...cvData!, education: newEdu });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, institution: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Institution URL</label>
                <input
                  type="text"
                  value={edu.institutionUrl || ""}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, institutionUrl: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Area</label>
                <input
                  type="text"
                  value={edu.area}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, area: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Study Type</label>
                <input
                  type="text"
                  value={edu.studyType}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, studyType: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Start Date</label>
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, startDate: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">End Date</label>
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, endDate: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Score</label>
                <input
                  type="text"
                  value={edu.score}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, score: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">CGPA</label>
                <input
                  type="text"
                  value={edu.cgpa}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, cgpa: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Scale</label>
                <input
                  type="text"
                  value={edu.scale}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, scale: e.target.value };
                    setCvData({ ...cvData!, education: newEdu });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
            </div>

          </div>
        )}
      />
    </div>
  );

  // Skills Tab (wrap existing code)
  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text">Technical Skills</h3>
          <button
            onClick={() => {
              const newSkill = { name: "", keywords: [] };
              setCvData({
                ...cvData!,
                skills: { 
                  ...cvData!.skills, 
                  technical: [newSkill, ...cvData!.skills.technical] 
                },
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>
        <DragDropList
          items={cvData.skills.technical}
          onReorder={newOrder => setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newOrder } })}
          renderItem={(skill, index) => (
            <div className="mb-4 p-4 bg-row rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={e => {
                    const newSkills = [...cvData.skills.technical];
                    newSkills[index] = { ...skill, name: e.target.value };
                    setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newSkills } });
                  }}
                  placeholder="Skill Group Name"
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
                <button
                  onClick={() => {
                    const newSkills = cvData.skills.technical.filter((_: any, i: number) => i !== index);
                    setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newSkills } });
                  }}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Skill Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-text">Keywords</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skill.keywords.map((keyword: string, kIndex: number) => (
                    <div key={kIndex} className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={keyword}
                        onChange={e => {
                          const newSkills = [...cvData.skills.technical];
                          const newKeywords = [...skill.keywords];
                          newKeywords[kIndex] = e.target.value;
                          newSkills[index] = { ...skill, keywords: newKeywords };
                          setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newSkills } });
                        }}
                        placeholder="Keyword"
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                      <button
                        onClick={() => {
                          const newSkills = [...cvData.skills.technical];
                          const newKeywords = skill.keywords.filter((_: any, i: number) => i !== kIndex);
                          newSkills[index] = { ...skill, keywords: newKeywords };
                          setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newSkills } });
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Keyword"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newSkills = [...cvData.skills.technical];
                      const newKeywords = [...skill.keywords, ""];
                      newSkills[index] = { ...skill, keywords: newKeywords };
                      setCvData({ ...cvData!, skills: { ...cvData.skills, technical: newSkills } });
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs mt-2 w-full justify-center"
                  >
                    <Plus className="w-3 h-3" />
                    Add Skill Keyword
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text">Methodologies</h3>
          <button
            onClick={() => {
              setCvData({
                ...cvData!,
                skills: { 
                  ...cvData!.skills, 
                  methodologies: ["", ...cvData!.skills.methodologies] 
                },
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Methodologies
          </button>
        </div>
        <div className="space-y-2">
          {cvData.skills.methodologies.map((methodology: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={methodology}
                onChange={(e) => {
                  const newMethodologies = [...cvData.skills.methodologies];
                  newMethodologies[index] = e.target.value;
                  setCvData({
                    ...cvData!,
                    skills: {
                      ...cvData!.skills,
                      methodologies: newMethodologies,
                    },
                  });
                }}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
              />
              <button
                onClick={() => {
                  const newMethodologies = cvData.skills.methodologies.filter(
                    (_: any, i: number) => i !== index
                  );
                  setCvData({
                    ...cvData!,
                    skills: {
                      ...cvData!.skills,
                      methodologies: newMethodologies,
                    },
                  });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  const renderCertificatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Certificates</h3>
        <button
          onClick={() => {
            const newCertificate = {
              name: "",
              date: "",
              issuer: "",
              url: "",
              customFields: [],
            };
            setCvData({
              ...cvData!,
              certificates: [newCertificate, ...cvData!.certificates],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>
      </div>

      <DragDropList
        items={cvData.certificates}
        onReorder={(newOrder) =>
          setCvData({ ...cvData!, certificates: newOrder })
        }
        renderItem={(cert, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-text">
                Certificate #{index + 1}
              </h4>
              <button
                onClick={() => {
                  const newCertificates = cvData.certificates.filter(
                    (_: any, i: number) => i !== index
                  );
                  setCvData({ ...cvData!, certificates: newCertificates });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Certificate Name
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = { ...cert, name: e.target.value };
                    setCvData({ ...cvData!, certificates: newCertificates });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Issuer
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = {
                      ...cert,
                      issuer: e.target.value,
                    };
                    setCvData({ ...cvData!, certificates: newCertificates });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={cert.date}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = { ...cert, date: e.target.value };
                    setCvData({ ...cvData!, certificates: newCertificates });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Certificate URL
                </label>
                <input
                  type="url"
                  value={cert.url}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = { ...cert, url: e.target.value };
                    setCvData({ ...cvData!, certificates: newCertificates });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
            </div>
            

          </div>
        )}
      />
    </div>
  );

  const renderLanguagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Languages</h3>
        <button
          onClick={() => {
            const newLanguage = {
              language: "",
              fluency: "",
              customFields: [],
            };
            setCvData({
              ...cvData!,
              languages: [newLanguage, ...cvData!.languages],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      <DragDropList
        items={cvData.languages}
        onReorder={(newOrder) => setCvData({ ...cvData!, languages: newOrder })}
        renderItem={(lang, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-text">Language #{index + 1}</h4>
              <button
                onClick={() => {
                  const newLanguages = cvData.languages.filter(
                    (_: any, i: number) => i !== index
                  );
                  setCvData({ ...cvData!, languages: newLanguages });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => {
                    const newLanguages = [...cvData.languages];
                    newLanguages[index] = { ...lang, language: e.target.value };
                    setCvData({ ...cvData!, languages: newLanguages });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Fluency
                </label>
                <input
                  type="text"
                  value={lang.fluency}
                  onChange={(e) => {
                    const newLanguages = [...cvData.languages];
                    newLanguages[index] = { ...lang, fluency: e.target.value };
                    setCvData({ ...cvData!, languages: newLanguages });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
            </div>

          </div>
        )}
      />
    </div>
  );

  const renderCoverLettersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Cover Letters</h3>
        <button
          onClick={() => {
            const newCoverLetter = {
              id: Date.now().toString(),
              title: `Cover Letter ${cvData.coverLetters.length + 1}`,
              content: "",
            };
            setCvData({
              ...cvData!,
              coverLetters: [newCoverLetter, ...cvData!.coverLetters],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Cover Letter
        </button>
      </div>

      <DragDropList
        items={cvData.coverLetters}
        onReorder={(newOrder) =>
          setCvData({ ...cvData!, coverLetters: newOrder })
        }
        renderItem={(coverLetter, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={coverLetter.title}
                  onChange={(e) => {
                    const newCoverLetters = [...cvData.coverLetters];
                    newCoverLetters[index] = {
                      ...coverLetter,
                      title: e.target.value,
                    };
                    setCvData({ ...cvData!, coverLetters: newCoverLetters });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <button
                onClick={() => {
                  const newCoverLetters = cvData.coverLetters.filter(
                    (_: any, i: number) => i !== index
                  );
                  setCvData({ ...cvData!, coverLetters: newCoverLetters });
                }}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Content
              </label>
              <textarea
                value={coverLetter.content}
                onChange={(e) => {
                  const newCoverLetters = [...cvData.coverLetters];
                  newCoverLetters[index] = {
                    ...coverLetter,
                    content: e.target.value,
                  };
                  setCvData({ ...cvData!, coverLetters: newCoverLetters });
                }}
                rows={15}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                placeholder="Write your cover letter here..."
              />
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderCustomTab = (tab: CustomTab) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editingTabName === tab.id ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                className="px-3 py-1 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    updateCustomTab(tab.id, { name: newTabName });
                    setEditingTabName(null);
                    setNewTabName("");
                  }
                }}
              />
              <button
                onClick={() => {
                  updateCustomTab(tab.id, { name: newTabName });
                  setEditingTabName(null);
                  setNewTabName("");
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-text">{tab.name}</h3>
              <button
                onClick={() => {
                  setEditingTabName(tab.id);
                  setNewTabName(tab.name);
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Edit Tab Name"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteCustomTab(tab.id)}
                className="p-1 text-red-500 hover:text-red-700"
                title="Delete Tab"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-lg font-semibold text-text">Custom Fields</label>
        <CustomFieldsToggle sectionId={tab.id} />
      </div>
      <DragDropList
        items={tab.customFields}
        onReorder={(newOrder) =>
          updateCustomTab(tab.id, { customFields: newOrder })
        }
        renderItem={(field: CustomField, index: number) => (
          <CustomFieldRow
            key={field.id}
            field={field}
            onChange={updates => {
              const newFields = [...tab.customFields];
              newFields[index] = { ...field, ...updates } as CustomField;
              updateCustomTab(tab.id, { customFields: newFields });
            }}
            onDelete={() => {
              const newFields = tab.customFields.filter((_: any, i: number) => i !== index);
              updateCustomTab(tab.id, { customFields: newFields });
            }}
            index={index}
          />
        )}
      />
      <button
        onClick={() => {
          const newFields = [
            ...tab.customFields,
            { id: Date.now().toString(), type: 'text' as const, label: '', value: '', order: tab.customFields.length }
          ];
          updateCustomTab(tab.id, { customFields: newFields });
        }}
        className="w-full mt-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        + Add Custom Field
      </button>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text">Projects</h3>
        <button
          onClick={() => {
            const newProject = {
              name: "",
              url: "",
              description: "",
              contributions: [] as string[],
              _newContrib: "",
            };
            setCvData({
              ...cvData!,
              projects: [newProject, ...(cvData!.projects || [])],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Project
        </button>
      </div>
      <DragDropList
        items={cvData.projects || []}
        onReorder={(newOrder: typeof cvData.projects) => setCvData({ ...cvData!, projects: newOrder })}
        renderItem={(project: typeof cvData.projects[0], index: number, dragProps: any) => (
          <div key={index} className="bg-sectionheader rounded-lg p-4 mb-4 relative">
            <button
              onClick={() => {
                const newProjects = cvData.projects.filter((_: any, i: number) => i !== index);
                setCvData({ ...cvData!, projects: newProjects });
              }}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text mb-1">Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={e => {
                    const newProjects = [...cvData.projects];
                    newProjects[index] = { ...project, name: e.target.value };
                    setCvData({ ...cvData!, projects: newProjects });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-text mb-1">Project URL</label>
                <input
                  type="url"
                  value={project.url}
                  onChange={e => {
                    const newProjects = [...cvData.projects];
                    newProjects[index] = { ...project, url: e.target.value };
                    setCvData({ ...cvData!, projects: newProjects });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-text mb-1">Short Description</label>
              <textarea
                value={project.description}
                onChange={e => {
                  const newProjects = [...cvData.projects];
                  newProjects[index] = { ...project, description: e.target.value };
                  setCvData({ ...cvData!, projects: newProjects });
                }}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-text">Contributions</h3>
              </div>
              <DragDropList
                items={project.contributions || []}
                onReorder={newOrder => {
                  const newProjects = [...cvData.projects];
                  newProjects[index] = { ...project, contributions: newOrder };
                  setCvData({ ...cvData!, projects: newProjects });
                }}
                renderItem={(contrib, cIndex) => (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={contrib}
                      onChange={e => {
                        const newProjects = [...cvData.projects];
                        const newContribs = [...(project.contributions || [])];
                        newContribs[cIndex] = e.target.value;
                        newProjects[index] = { ...project, contributions: newContribs };
                        setCvData({ ...cvData!, projects: newProjects });
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                    />
                    <button
                      onClick={() => {
                        const newProjects = [...cvData.projects];
                        const newContribs = (project.contributions || []).filter((_: any, i: number) => i !== cIndex);
                        newProjects[index] = { ...project, contributions: newContribs };
                        setCvData({ ...cvData!, projects: newProjects });
                      }}
                      className="ml-2 text-red-600 hover:text-red-800"
                      title="Delete contribution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              />
              <div className="mt-2">
                <button
                  onClick={() => {
                    const newProjects = [...cvData.projects];
                    const newContribs = [...(project.contributions || []), ""];
                    newProjects[index] = { ...project, contributions: newContribs };
                    setCvData({ ...cvData!, projects: newProjects });
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add Contribution
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basics":
        return renderBasicsTab();
      case "contacts":
        return renderContactsTab();
      case "work":
        return renderWorkTab();
      case "education":
        return renderEducationTab();
      case "academic":
        return renderAcademicTab();
      case "skills":
        return renderSkillsTab();
      case "certificates":
        return renderCertificatesTab();
      case "languages":
        return renderLanguagesTab();
      case "coverLetters":
        return renderCoverLettersTab();
      case "projects":
        return renderProjectsTab();
      case "passwordBank":
        return renderPasswordBankTab();
      case "backup-restore":
        return renderBackupRestoreTab();
      case "email-manager":
        return renderEmailManagerTab();
      default:
        const customTab = cvData.customTabs.find((tab) => tab.id === activeTab);
        if (customTab) {
          return renderCustomTab(customTab);
        }
        return renderBasicsTab();
    }
  };

  // Handler for Restore Backup
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      // Basic validation: check for some required fields
      if (!json.basics || !json.contacts) {
        setToast({ message: "Invalid backup file.", type: "error" });
        return;
      }
      await saveCVData(json);
      setCvData(json);
      setToast({ message: "Backup restored successfully!", type: "success" });
      if (onDataChange) onDataChange();
    } catch (err) {
      setToast({ message: "Failed to restore backup.", type: "error" });
    }
  };

  // State management for password visibility - moved outside the render function to follow React Hooks rules
  const renderPasswordBankTab = () => {
    // Initialize passwordBank if it doesn't exist
    if (!cvData.passwordBank) {
      setCvData({
        ...cvData,
        passwordBank: []
      });
    }

    // Function to toggle vendor card expansion
    const toggleVendorExpansion = (index: number) => {
      const newPasswordBank = [...cvData.passwordBank];
      newPasswordBank[index] = {
        ...newPasswordBank[index],
        isExpanded: !newPasswordBank[index].isExpanded
      };
      setCvData({
        ...cvData,
        passwordBank: newPasswordBank
      });
    };

    // Function to toggle sub-card expansion
    const toggleSubCardExpansion = (vendorIndex: number, subCardIndex: number) => {
      const newPasswordBank = [...cvData.passwordBank];
      const vendor = newPasswordBank[vendorIndex];
      const accounts = [...vendor.accounts];
      accounts[subCardIndex] = {
        ...accounts[subCardIndex],
        isExpanded: !accounts[subCardIndex].isExpanded
      };
      newPasswordBank[vendorIndex] = {
        ...vendor,
        accounts: accounts
      };
      setCvData({
        ...cvData,
        passwordBank: newPasswordBank
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text">Password Bank</h3>
          <button
            onClick={() => {
              const newVendor = {
                name: "",
                url: "",
                accounts: [],
                isExpanded: true
              };
              setCvData({
                ...cvData,
                passwordBank: [...(cvData.passwordBank || []), newVendor]
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Vendor
          </button>
        </div>

        <DragDropList
          items={(cvData.passwordBank || []).map((vendor, index) => ({
            id: index.toString(),
            data: vendor
          }))}
          onReorder={(newOrder) => {
            const reorderedVendors = newOrder.map(item => item.data);
            setCvData({
              ...cvData,
              passwordBank: reorderedVendors
            });
          }}
          renderItem={(item, index) => {
            const vendor = item.data;
            const vendorIndex = parseInt(item.id);
            return (
          <div key={vendorIndex} className="bg-sectionheader rounded-lg overflow-hidden mb-4">
            {/* Vendor Card Header */}
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-opacity-80"
              onClick={() => toggleVendorExpansion(vendorIndex)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-text">
                  {vendor.name || "New Vendor"} {vendor.url && `(${vendor.url})`}
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newPasswordBank = cvData.passwordBank.filter((_, i) => i !== vendorIndex);
                  setCvData({
                    ...cvData,
                    passwordBank: newPasswordBank
                  });
                }}
                className="text-red-600 hover:text-red-800 ml-2"
                title="Delete Vendor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Vendor Card Content */}
            {vendor.isExpanded && (
              <div className="p-4 border-t border-border">
                {/* Vendor Details Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text mb-1">Vendor Name</label>
                    <input
                      type="text"
                      value={vendor.name}
                      onChange={(e) => {
                        const newPasswordBank = [...cvData.passwordBank];
                        newPasswordBank[vendorIndex] = {
                          ...vendor,
                          name: e.target.value
                        };
                        setCvData({
                          ...cvData,
                          passwordBank: newPasswordBank
                        });
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text mb-1">Vendor URL</label>
                    <input
                      type="url"
                      value={vendor.url}
                      onChange={(e) => {
                        const newPasswordBank = [...cvData.passwordBank];
                        newPasswordBank[vendorIndex] = {
                          ...vendor,
                          url: e.target.value
                        };
                        setCvData({
                          ...cvData,
                          passwordBank: newPasswordBank
                        });
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                    />
                  </div>
                </div>

                {/* Sub-cards Section */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-md font-semibold text-text">Accounts</h5>
                  </div>

                  {/* Sub-cards List */}
                  {(vendor.accounts || []).map((account, accountIndex) => (
                    <div key={accountIndex} className="bg-row rounded-lg overflow-hidden mb-3">
                      {/* Sub-card Header */}
                      <div 
                        className="flex justify-between items-center p-3 cursor-pointer hover:bg-opacity-80 bg-opacity-50 bg-gray-200 dark:bg-gray-700"
                        onClick={() => toggleSubCardExpansion(vendorIndex, accountIndex)}
                      >
                        <div className="flex-1">
                          <h6 className="font-medium text-text">
                            {account.email || account.username || "New Account"}
                          </h6>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newPasswordBank = [...cvData.passwordBank];
                            const newAccounts = vendor.accounts.filter((_, i) => i !== accountIndex);
                            newPasswordBank[vendorIndex] = {
                              ...vendor,
                              accounts: newAccounts
                            };
                            setCvData({
                              ...cvData,
                              passwordBank: newPasswordBank
                            });
                          }}
                          className="text-red-600 hover:text-red-800 ml-2"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sub-card Content */}
                      {account.isExpanded && (
                        <div className="p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Email</label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={account.email}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      email: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                                {account.email && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(account.email)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                                    title="Copy to clipboard"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Username</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={account.username}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      username: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                                {account.username && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(account.username)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                                    title="Copy to clipboard"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Password</label>
                              <div className="relative">
                                <input
                                  type={passwordVisibility[`${vendorIndex}-${accountIndex}`] ? "text" : "password"}
                                  value={account.password}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      password: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  className="w-full px-3 py-2 pr-20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex">
                                  {account.password && (
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(account.password)}
                                      className="text-gray-500 hover:text-blue-500 mr-2"
                                      title="Copy to clipboard"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(vendorIndex, accountIndex)}
                                    className="text-gray-500 hover:text-blue-500"
                                    title={passwordVisibility[`${vendorIndex}-${accountIndex}`] ? "Hide password" : "Show password"}
                                  >
                                    {passwordVisibility[`${vendorIndex}-${accountIndex}`] ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Recovery Phone</label>
                              <input
                                type="tel"
                                value={account.recoveryPhone}
                                onChange={(e) => {
                                  const newPasswordBank = [...cvData.passwordBank];
                                  const newAccounts = [...vendor.accounts];
                                  newAccounts[accountIndex] = {
                                    ...account,
                                    recoveryPhone: e.target.value
                                  };
                                  newPasswordBank[vendorIndex] = {
                                    ...vendor,
                                    accounts: newAccounts
                                  };
                                  setCvData({
                                    ...cvData,
                                    passwordBank: newPasswordBank
                                  });
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Recovery Email</label>
                              <input
                                type="email"
                                value={account.recoveryEmail}
                                onChange={(e) => {
                                  const newPasswordBank = [...cvData.passwordBank];
                                  const newAccounts = [...vendor.accounts];
                                  newAccounts[accountIndex] = {
                                    ...account,
                                    recoveryEmail: e.target.value
                                  };
                                  newPasswordBank[vendorIndex] = {
                                    ...vendor,
                                    accounts: newAccounts
                                  };
                                  setCvData({
                                    ...cvData,
                                    passwordBank: newPasswordBank
                                  });
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">Modification Date</label>
                              <input
                                type="date"
                                value={account.modificationDate}
                                onChange={(e) => {
                                  const newPasswordBank = [...cvData.passwordBank];
                                  const newAccounts = [...vendor.accounts];
                                  newAccounts[accountIndex] = {
                                    ...account,
                                    modificationDate: e.target.value
                                  };
                                  newPasswordBank[vendorIndex] = {
                                    ...vendor,
                                    accounts: newAccounts
                                  };
                                  setCvData({
                                    ...cvData,
                                    passwordBank: newPasswordBank
                                  });
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-1">2FA</label>
                              <select
                                value={account.twoFactorEnabled ? "Yes" : "No"}
                                onChange={(e) => {
                                  const newPasswordBank = [...cvData.passwordBank];
                                  const newAccounts = [...vendor.accounts];
                                  newAccounts[accountIndex] = {
                                    ...account,
                                    twoFactorEnabled: e.target.value === "Yes"
                                  };
                                  newPasswordBank[vendorIndex] = {
                                    ...vendor,
                                    accounts: newAccounts
                                  };
                                  setCvData({
                                    ...cvData,
                                    passwordBank: newPasswordBank
                                  });
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                              >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>

                          {/* 2FA Additional Fields */}
                          {account.twoFactorEnabled && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-text mb-1">2FA Phone</label>
                                <input
                                  type="tel"
                                  value={account.twoFactorPhone}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      twoFactorPhone: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text mb-1">2FA Email</label>
                                <input
                                  type="email"
                                  value={account.twoFactorEmail}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      twoFactorEmail: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-1">More 2FA Details</label>
                                <textarea
                                  value={account.twoFactorDetails}
                                  onChange={(e) => {
                                    const newPasswordBank = [...cvData.passwordBank];
                                    const newAccounts = [...vendor.accounts];
                                    newAccounts[accountIndex] = {
                                      ...account,
                                      twoFactorDetails: e.target.value
                                    };
                                    newPasswordBank[vendorIndex] = {
                                      ...vendor,
                                      accounts: newAccounts
                                    };
                                    setCvData({
                                      ...cvData,
                                      passwordBank: newPasswordBank
                                    });
                                  }}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                />
                              </div>
                            </div>
                          )}

                          {/* Additional Data */}
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-text mb-1">Additional Data / Log</label>
                            <textarea
                              value={account.additionalData}
                              onChange={(e) => {
                                const newPasswordBank = [...cvData.passwordBank];
                                const newAccounts = [...vendor.accounts];
                                newAccounts[accountIndex] = {
                                  ...account,
                                  additionalData: e.target.value
                                };
                                newPasswordBank[vendorIndex] = {
                                  ...vendor,
                                  accounts: newAccounts
                                };
                                setCvData({
                                  ...cvData,
                                  passwordBank: newPasswordBank
                                });
                              }}
                              rows={4}
                              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add New Account Button at bottom of vendor card */}
                {vendor.isExpanded && (
                  <div className="p-4 border-t border-border">
                    <button
                      onClick={() => {
                        const newPasswordBank = [...cvData.passwordBank];
                        const newAccount = {
                          email: "",
                          username: "",
                          password: "",
                          recoveryPhone: "",
                          recoveryEmail: "",
                          modificationDate: new Date().toISOString().split('T')[0],
                          twoFactorEnabled: false,
                          twoFactorPhone: "",
                          twoFactorEmail: "",
                          twoFactorDetails: "",
                          additionalData: "",
                          isExpanded: true
                        };
                        newPasswordBank[vendorIndex] = {
                          ...vendor,
                          accounts: [...(vendor.accounts || []), newAccount]
                        };
                        setCvData({
                          ...cvData,
                          passwordBank: newPasswordBank
                        });
                      }}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add New Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
            );
          }}
        />
      </div>
    );
  };

  // Download backup handler
  const handleDownloadBackup = () => {
    if (!cvData) return;
    // Get BD time (GMT+6)
    const now = new Date();
    const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const date = bdTime.toISOString().slice(0, 10);
    const time = bdTime.toISOString().slice(11, 19).replace(/:/g, '-');
    const filename = `ronydb_backup_${date}_${time}_BD.json`;
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Backup downloaded!', type: 'success' });
  };
  
  // Render the Backup-Restore tab
  const renderBackupRestoreTab = () => {
    return (
      <BackupRestore 
        cvData={cvData} 
        onDataChange={onDataChange} 
        setCvData={setCvData} 
      />
    );
  };

  // Render the Email Manager tab
  const renderEmailManagerTab = () => {
    return (
      <EmailManager className="mt-4" />
    );
  };

  return (
    <>
      {/* Toast for data saved */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Save className="w-5 h-5 mr-2" />
          Data saved successfully!
        </div>
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      {/* Main wrapper */}
      <div className="min-h-screen bg-bg text-text">
        <div className="flex justify-end p-2 md:p-4">
          <ThemeToggle />
        </div>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-2 md:py-4 lg:py-8">
          {/* Header with Rony.DB and backup/restore button group */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-bg">
            <div className="text-xl md:text-2xl font-bold text-primary select-none tracking-wider">
              Rony.DB
            </div>
          </div>
          {/* Tab Order Card at the Top */}
          <section className="mb-4 md:mb-8">
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-sectionheader px-4 md:px-6 py-3 md:py-4 border-b border-border rounded-t-lg flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-text m-0">
                  Tab Order
                </h3>
                {/* User Info Display */}
                <div className="flex items-center space-x-3 text-sm">
                  <div className="text-right">
                    {currentUser ? (
                      <>
                        <div className="font-medium text-text">{currentUser.name}</div>
                        <div className="font-small text-xs">{currentUser.email}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          currentUser.role === 'admin' 
                            ? 'bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {currentUser.role.toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-xs">Loading user...</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-card px-4 md:px-6 py-3 md:py-4 rounded-b-lg">
                <DragDropList
                  items={cvData.tabOrder
                    .filter(id => !['passwordBank', 'backup-restore', 'email-manager'].includes(id))
                    .map((id) => ({
                      id,
                      label: tabs.find((t) => t.id === id)?.label || id,
                    }))}
                  onReorder={(newOrder) => {
                    const systemTabs = ['passwordBank', 'backup-restore', 'email-manager'];
                    const reorderedIds = newOrder.map((item) => item.id);
                    const fullOrder = [...reorderedIds, ...systemTabs];
                    reorderTabs(fullOrder);
                  }}
                  renderItem={(item) => (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm md:text-base">{item.label}</span>
                    </div>
                  )}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
                />
              </div>
            </div>
          </section>

          {/* Dashboard Header and Tabs Card */}
          <section className="mb-8">
            <div className="bg-card border border-border rounded-lg shadow-md">
              {/* Header with title, view CV, save, logout */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-sectionheader px-4 md:px-6 py-4 rounded-t-lg border-b border-border">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <h1 className="text-xl md:text-2xl font-bold text-primary flex-1">
                    Rony.DB Dashboard
                  </h1>
                </div>
                <div className="flex items-center gap-1 md:gap-2 ml-auto">
                  {/* Mobile: Icon-only buttons */}
                  <div className="flex md:hidden gap-1">
                    <button
                      onClick={() => {
                        window.history.pushState({}, "", "/");
                        const navEvent = new PopStateEvent("popstate");
                        window.dispatchEvent(navEvent);
                      }}
                      className="p-2 bg-card text-primary border border-border rounded-md hover:bg-row transition-colors"
                      title="View CV"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="p-2 bg-card text-primary border border-border rounded-md hover:bg-row transition-colors"
                      title="Save Changes"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onLogout}
                      className="p-2 bg-card text-primary border border-border rounded-md hover:bg-row transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Desktop: Full buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.history.pushState({}, "", "/");
                        const navEvent = new PopStateEvent("popstate");
                        window.dispatchEvent(navEvent);
                      }}
                      className="px-2.5 py-1.5 bg-card text-primary border border-border rounded-full text-base hover:bg-row transition-colors"
                      title="View CV"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-2.5 py-1.5 bg-card text-primary border border-border rounded-full text-base hover:bg-row transition-colors"
                      title="Save Changes"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onLogout}
                      className="px-2.5 py-1.5 bg-card text-primary border border-border rounded-full text-base hover:bg-row transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dev Tools Security Toggle */}
                  <div className="flex items-center gap-2 bg-card rounded-lg shadow px-2 py-1 border border-border">
                    <button
                      onClick={toggleDevToolsProtection}
                      className={`inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md transition-colors ${
                        devToolsProtectionEnabled 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={`Dev Tools Security: ${devToolsProtectionEnabled ? 'Enabled' : 'Disabled'}`}
                      type="button"
                    >
                      {devToolsProtectionEnabled ? (
                        <Shield className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ShieldOff className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>

                  {/* Backup/Restore Button Group - Mobile Optimized */}
                  <div className="flex gap-1 bg-card rounded-lg shadow px-1 md:px-2 py-1 border border-border">
                    <button
                      onClick={handleDownloadBackup}
                      className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md hover:bg-accent/10 text-primary hover:text-blue-600 transition-colors"
                      title="Download Backup"
                      type="button"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={handleRestoreClick}
                      className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md hover:bg-accent/10 text-primary hover:text-green-600 transition-colors"
                      title="Restore Backup"
                      type="button"
                    >
                      <Upload className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <input
                      type="file"
                      accept="application/json"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs - Mobile Responsive */}
              <div className="flex flex-wrap gap-1 md:gap-2 px-4 md:px-6 py-3 md:py-4 bg-card border-t border-border rounded-b-lg">
                {tabs.filter(tab => !['passwordBank', 'backup-restore', 'email-manager'].includes(tab.id)).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors duration-200 border border-border
                      ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow"
                          : "bg-row text-text hover:bg-sectionheader"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={addNewTab}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium bg-card text-primary border border-border hover:bg-row ml-1 md:ml-2"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Add Custom Tab</span>
                  <span className="sm:hidden">Add</span>
                </button>
                
                {/* Horizontal Divider */}
                <div className="w-full h-px bg-border my-2"></div>
                
                {/* System Tabs Group */}
                <div className="w-full flex flex-wrap gap-1 md:gap-2">
                  {tabs.filter(tab => ['passwordBank', 'backup-restore', 'email-manager'].includes(tab.id)).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors duration-200 border border-border
                        ${
                          activeTab === tab.id
                            ? "bg-primary text-white shadow"
                            : "bg-row text-text hover:bg-sectionheader"
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tab Content */}
              <div className="p-4 md:p-6">{renderTabContent()}</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

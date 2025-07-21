import React, { useState, useEffect, useRef } from "react";
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
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
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
  // Set browser tab title
  useEffect(() => {
    document.title = "Dashboard | Rony.DB";
  }, []);

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
  const [expandedState, setExpandedState] = useState<{ [key: string]: boolean }>({});

  const toggleExpanded = (key: string) => {
    setExpandedState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    (async () => {
      const supabaseData = await fetchCVDataFromSupabase();
      if (supabaseData) {
        const tabOrder = supabaseData.tabOrder || [];
        const requiredTabs = ["projects", "passwordBank"];
        let updatedTabOrder = [...tabOrder];

        requiredTabs.forEach((tab) => {
          if (!updatedTabOrder.includes(tab)) {
            updatedTabOrder.push(tab);
          }
        });
        
        setCvData({ ...supabaseData, tabOrder: updatedTabOrder });
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

  const addCustomTab = () => {
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
    { id: "skills", label: "Skills" },
    { id: "certificates", label: "Certificates" },
    { id: "languages", label: "Languages" },
    { id: "coverLetters", label: "Cover Letters" },
    { id: "projects", label: "Projects" },
    { id: "passwordBank", label: "Password Bank" },
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
      
      <div className="mt-6 md:mt-8">
        <label className="block text-lg font-semibold text-text mb-4">Custom Fields</label>
        <DragDropList
          items={cvData.basics.customFields}
          onReorder={newOrder => setCvData({
            ...cvData!,
            basics: { ...cvData!.basics, customFields: newOrder }
          })}
          renderItem={(field: CustomField, index: number, dragHandleProps: any) => (
            <CustomFieldRow
              key={field.id}
              field={field}
              onChange={updates => {
                const newFields = [...cvData.basics.customFields];
                newFields[index] = { ...field, ...updates };
                setCvData({ ...cvData!, basics: { ...cvData!.basics, customFields: newFields } });
              }}
              onDelete={() => {
                const newFields = cvData.basics.customFields.filter((_: any, i: number) => i !== index);
                setCvData({ ...cvData!, basics: { ...cvData!.basics, customFields: newFields } });
              }}
              index={index}
              dragHandleProps={dragHandleProps}
            />
          )}
        />
        <button
          onClick={() => {
            const newFields: CustomField[] = [
              ...cvData.basics.customFields,
              { id: Date.now().toString(), type: 'text', label: '', value: '', order: cvData.basics.customFields.length }
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
              })}
            renderItem={(profile, index, dragHandleProps: any) => (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full">
                <span {...dragHandleProps} className="cursor-move self-center pr-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
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
            renderItem={(tool, index, dragHandleProps: any) => (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full">
                <span {...dragHandleProps} className="cursor-move self-center pr-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
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
        renderItem={(job, index, dragHandleProps: any) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span {...dragHandleProps} className="cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
              <h4 className="font-medium text-text">Job #{index + 1}</h4>
              </div>
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
              <h3 className="text-md font-semibold text-text mb-2">Highlights</h3>
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
                  newJobs[index] = {
                    ...job,
                    highlights: [...(job.highlights || []), ""],
                  };
                  setCvData({ ...cvData, work: newJobs });
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Highlight
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );

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
              url: "",
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
        renderItem={(edu, index, dragHandleProps: any) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span {...dragHandleProps} className="cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
              <h4 className="font-medium text-text">Education #{index + 1}</h4>
              </div>
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
                  type="url"
                  value={edu.url}
                  onChange={e => {
                    const newEdu = [...cvData.education];
                    newEdu[index] = { ...edu, url: e.target.value };
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
              const newTechnicalSkills = [newSkill, ...cvData.skills.technical];
              setCvData({
                ...cvData!,
                skills: { ...cvData.skills, technical: newTechnicalSkills },
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
          renderItem={(skill, index, dragHandleProps: any) => (
            <div className="mb-4 p-4 bg-row rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span {...dragHandleProps} className="cursor-move pr-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
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
                  className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-3 h-3" />
                  Add Keyword
                </button>
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
              const newMethodologies = ["", ...cvData.skills.methodologies];
              setCvData({
                ...cvData!,
                skills: { ...cvData.skills, methodologies: newMethodologies },
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Methodology
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
          setCvData({ ...cvData!, certificates: newOrder })}
        renderItem={(cert, index, dragHandleProps: any) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span {...dragHandleProps} className="cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
              <h4 className="font-medium text-text">
                Certificate #{index + 1}
              </h4>
              </div>
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
        renderItem={(lang, index, dragHandleProps: any) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span {...dragHandleProps} className="cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
              <h4 className="font-medium text-text">Language #{index + 1}</h4>
              </div>
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
          setCvData({ ...cvData!, coverLetters: newOrder })}
        renderItem={(coverLetter, index, dragHandleProps: any) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 flex items-center gap-2">
                <span {...dragHandleProps} className="cursor-move pr-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </span>
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
      <DragDropList
        items={tab.customFields}
        onReorder={(newOrder) =>
          updateCustomTab(tab.id, { customFields: newOrder })}
        renderItem={(field: CustomField, index: number, dragHandleProps: any) => (
          <CustomFieldRow
            key={field.id}
            field={field}
            onChange={updates => {
              const newFields = [...tab.customFields];
              newFields[index] = { ...field, ...updates };
              updateCustomTab(tab.id, { customFields: newFields });
            }}
            onDelete={() => {
              const newFields = tab.customFields.filter((_: any, i: number) => i !== index);
              updateCustomTab(tab.id, { customFields: newFields });
            }}
            index={index}
            dragHandleProps={dragHandleProps}
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
        renderItem={(project: typeof cvData.projects[0], index: number, dragHandleProps: any) => (
          <div key={project.id || index} className="bg-sectionheader rounded-lg p-4 mb-4 relative">
            <span {...dragHandleProps} className="cursor-move absolute top-1/2 -left-2 -translate-y-1/2">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </span>
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
              <h3 className="text-md font-semibold text-text mb-2">Contributions</h3>
              <DragDropList
                items={project.contributions || []}
                onReorder={newOrder => {
                        const newProjects = [...cvData.projects];
                  newProjects[index] = { ...project, contributions: newOrder };
                        setCvData({ ...cvData!, projects: newProjects });
                      }}
                renderItem={(contribution, cIndex) => (
                  <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                      value={contribution}
                  onChange={e => {
                        const newContributions = [...project.contributions];
                        newContributions[cIndex] = e.target.value;
                    const newProjects = [...cvData.projects];
                        newProjects[index] = { ...project, contributions: newContributions };
                    setCvData({ ...cvData!, projects: newProjects });
                  }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                    />
                    <button
                      onClick={() => {
                        const newContributions = project.contributions.filter((_: any, i: number) => i !== cIndex);
                      const newProjects = [...cvData.projects];
                        newProjects[index] = { ...project, contributions: newContributions };
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
               <button
                onClick={() => {
                  const newProjects = [...cvData.projects];
                  newProjects[index] = {
                    ...project,
                    contributions: [...(project.contributions || []), ""],
                  };
                  setCvData({ ...cvData, projects: newProjects });
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Contribution
              </button>
              </div>
              <button
                onClick={() => {
                  const newProjects = cvData.projects.filter((_: any, i: number) => i !== index);
                  setCvData({ ...cvData!, projects: newProjects });
                }}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded-full"
                title="Delete Project"
              >
              <Trash2 className="w-4 h-4" />
              </button>
            </div>
        )}
      />
          </div>
  );

  const renderPasswordBankTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text">Password Bank</h3>
        <button
          onClick={() => {
            const newVendor = {
              id: Date.now().toString(),
              vendorName: "New Vendor",
              vendorUrl: "",
              credentials: [
                {
                  id: Date.now().toString(),
                  username: "",
                  email: "",
                  password: "",
                  recoveryPhone: "",
                  recoveryEmail: "",
                  date: new Date().toISOString(),
                  twoFactorAuth: 'No' as 'No',
                  twoFactorAuthPhone: "",
                  twoFactorAuthCodes: "",
                  additionalData: "",
                },
              ],
            };
            setCvData({
              ...cvData!,
              passwordBank: [newVendor, ...(cvData!.passwordBank || [])],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add New Vendor
        </button>
      </div>
      <DragDropList
        items={cvData.passwordBank || []}
        onReorder={(newOrder) => setCvData({ ...cvData!, passwordBank: newOrder })}
        renderItem={(vendor, vIndex, dragHandleProps) => {
          const isVendorExpanded = expandedState[vendor.id] ?? true;
          return (
            <div className="bg-sectionheader rounded-lg mb-4 relative">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => toggleExpanded(vendor.id)}>
                  <span {...dragHandleProps} className="cursor-move">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </span>
                  <h4 className="text-lg font-semibold text-text">{vendor.vendorName}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <a href={vendor.vendorUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {vendor.vendorUrl}
                  </a>
                  <button
                    onClick={() => {
                      const newPasswordBank = cvData.passwordBank!.filter((_, i) => i !== vIndex);
                      setCvData({ ...cvData!, passwordBank: newPasswordBank });
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1" onClick={() => toggleExpanded(vendor.id)}>
                    {isVendorExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isVendorExpanded && (
                <div className="p-4">
                  {/* Vendor Name and URL inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={vendor.vendorName}
                        onChange={(e) => {
                          const newPasswordBank = [...cvData.passwordBank!];
                          newPasswordBank[vIndex] = { ...vendor, vendorName: e.target.value };
                          setCvData({ ...cvData!, passwordBank: newPasswordBank });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Vendor URL</label>
                      <input
                        type="url"
                        value={vendor.vendorUrl}
                        onChange={(e) => {
                          const newPasswordBank = [...cvData.passwordBank!];
                          newPasswordBank[vIndex] = { ...vendor, vendorUrl: e.target.value };
                          setCvData({ ...cvData!, passwordBank: newPasswordBank });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                      />
                    </div>
                  </div>

                  {/* Credentials Section */}
                  <div className="space-y-4">
                    {vendor.credentials.map((cred: any, cIndex: number) => {
                      const isCredExpanded = expandedState[cred.id] ?? false; // Default to collapsed
                      return (
                        <div key={cred.id} className="bg-card border border-border rounded-lg relative">
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer" 
                            onClick={(e) => handleCredentialToggle(e, cred.id)}
                          >
                            <div className="flex items-center gap-4">
                              <h5 className="font-semibold text-text truncate">{cred.email || 'No Email'}</h5>
                              <span className="text-sm text-gray-500 truncate">{cred.username || 'No Username'}</span>
                            </div>
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newPasswordBank = [...cvData.passwordBank!];
                                  newPasswordBank[vIndex].credentials = vendor.credentials.filter((_: any, i: number) => i !== cIndex);
                                  setCvData({ ...cvData!, passwordBank: newPasswordBank });
                                }}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full mr-2"
                                title="Delete Credential"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-1">
                                {isCredExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {isCredExpanded && (
                            <div className="p-4 border-t border-border">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Username */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Username</label>
                                  <input type="text" value={cred.username} onChange={e => handleCredentialChange(vIndex, cIndex, 'username', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                                {/* Email */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Email</label>
                                  <input type="email" value={cred.email} onChange={e => handleCredentialChange(vIndex, cIndex, 'email', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                                {/* Password with toggle */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Password</label>
                                  <div className="relative">
                                    <input
                                      type={cred.showPassword ? 'text' : 'password'}
                                      value={cred.password}
                                      onChange={e => handleCredentialChange(vIndex, cIndex, 'password', e.target.value)}
                                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text pr-10"
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      onClick={() => {
                                        const newPasswordBank = [...cvData.passwordBank!];
                                        const creds = [...vendor.credentials];
                                        creds[cIndex] = { ...creds[cIndex], showPassword: !creds[cIndex].showPassword };
                                        newPasswordBank[vIndex] = { ...vendor, credentials: creds };
                                        setCvData({ ...cvData!, passwordBank: newPasswordBank });
                                      }}
                                      tabIndex={-1}
                                    >
                                      {cred.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                  </div>
                                </div>
                                {/* Recovery Phone */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Recovery Phone</label>
                                  <input type="text" value={cred.recoveryPhone} onChange={e => handleCredentialChange(vIndex, cIndex, 'recoveryPhone', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                                {/* Recovery Email */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Recovery Email</label>
                                  <input type="email" value={cred.recoveryEmail} onChange={e => handleCredentialChange(vIndex, cIndex, 'recoveryEmail', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                                {/* Date */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">Date</label>
                                  <input type="date" value={cred.date.split('T')[0]} onChange={e => handleCredentialChange(vIndex, cIndex, 'date', new Date(e.target.value).toISOString())} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                                {/* 2FA */}
                                <div>
                                  <label className="block text-sm font-medium text-text mb-1">2FA</label>
                                  <select value={cred.twoFactorAuth} onChange={e => handleCredentialChange(vIndex, cIndex, 'twoFactorAuth', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text">
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                  </select>
                                </div>
                                {cred.twoFactorAuth === 'Yes' && (
                                  <>
                                    <div>
                                      <label className="block text-sm font-medium text-text mb-1">2FA Phone</label>
                                      <input
                                        type="text"
                                        value={cred.twoFactorAuthPhone || ''}
                                        onChange={(e) => handleCredentialChange(vIndex, cIndex, 'twoFactorAuthPhone', e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-text mb-1">2FA Codes</label>
                                      <textarea
                                        value={cred.twoFactorAuthCodes || ''}
                                        onChange={(e) => handleCredentialChange(vIndex, cIndex, 'twoFactorAuthCodes', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                                      />
                                    </div>
                                  </>
                                )}
                                {/* Additional Data */}
                                <div className="md:col-span-2 lg:col-span-3">
                                  <label className="block text-sm font-medium text-text mb-1">Additional Data</label>
                                  <textarea value={cred.additionalData} onChange={e => handleCredentialChange(vIndex, cIndex, 'additionalData', e.target.value)} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"/>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Credential Button */}
                  <button
                    onClick={() => {
                      const newCredential = {
                        id: Date.now().toString(),
                        username: "",
                        email: "",
                        password: "",
                        recoveryPhone: "",
                        recoveryEmail: "",
                        date: new Date().toISOString(),
                        twoFactorAuth: 'No' as 'No',
                        twoFactorAuthPhone: "",
                        twoFactorAuthCodes: "",
                        additionalData: "",
                      };
                      const newPasswordBank = [...cvData.passwordBank!];
                      newPasswordBank[vIndex].credentials.push(newCredential);
                      setCvData({ ...cvData!, passwordBank: newPasswordBank });
                    }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Credential
                  </button>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basics":
        return renderBasicsTab();
      case "contacts":
        return renderContactsTab();
      case "tools":
        return renderToolsTab();
      case "work":
        return renderWorkTab();
      case "education":
        return renderEducationTab();
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

  const handleCredentialChange = (vIndex: number, cIndex: number, field: string, value: any) => {
    const newPasswordBank = [...cvData.passwordBank!];
    const updatedCredentials = [...newPasswordBank[vIndex].credentials];
    updatedCredentials[cIndex] = { ...updatedCredentials[cIndex], [field]: value, date: new Date().toISOString() };
    newPasswordBank[vIndex] = { ...newPasswordBank[vIndex], credentials: updatedCredentials };
    setCvData({ ...cvData!, passwordBank: newPasswordBank });
  };

  const handleCredentialToggle = (e: React.MouseEvent, credId: string) => {
    e.stopPropagation();
    toggleExpanded(credId);
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
              <div className="bg-sectionheader px-4 md:px-6 py-3 md:py-4 border-b border-border rounded-t-lg">
                <h3 className="text-base md:text-lg font-semibold text-text m-0">
                  Tab Order
                </h3>
              </div>
              <div className="bg-card px-4 md:px-6 py-3 md:py-4 rounded-b-lg">
                <DragDropList
                  items={cvData.tabOrder.map((id) => ({
                    id,
                    label: tabs.find((t) => t.id === id)?.label || id,
                  }))}
                  onReorder={(newOrder) =>
                    reorderTabs(newOrder.map((item) => item.id))
                  }
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
                {tabs.map((tab) => (
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
                  onClick={addCustomTab}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium bg-card text-primary border border-border hover:bg-row ml-1 md:ml-2"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Add Custom Tab</span>
                  <span className="sm:hidden">Add</span>
                </button>
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

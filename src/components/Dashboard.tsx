import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Save, Plus, Trash2, GripVertical, Edit, Linkedin, Github, Twitter, Facebook, Instagram, Globe, Hash, Layers, ExternalLink } from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaTelegram, FaReddit, FaDiscord, FaSnapchatGhost, FaPinterest, FaMedium, FaDribbble, FaBehance, FaStackOverflow, FaFacebookMessenger, FaGlobe } from 'react-icons/fa';
import { getCVData, saveCVData, fetchCVDataFromSupabase } from '../utils/cvData';
import { CVData, CustomTab, CustomField } from '../types/cv';
import FileUpload from './FileUpload';
import { CustomFieldEditor } from './CustomFieldEditor';
import DragDropList from './DragDropList';
import Select from 'react-select';

interface DashboardProps {
  onLogout: () => void;
  onDataChange?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onDataChange }) => {
  // All hooks at the top
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basics');
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState('');
  let saveTimeout: any = null;

  useEffect(() => {
    (async () => {
      const supabaseData = await fetchCVDataFromSupabase();
      setCvData(supabaseData);
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
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading...</div>;
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
      name: 'New Tab',
      customFields: []
    };
    setCvData({
      ...cvData!,
      customTabs: [...cvData!.customTabs, newTab],
      tabOrder: [...cvData!.tabOrder, newTab.id]
    });
  };

  const updateCustomTab = (tabId: string, updates: Partial<CustomTab>) => {
    setCvData({
      ...cvData!,
      customTabs: cvData!.customTabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    });
  };

  const deleteCustomTab = (tabId: string) => {
    setCvData({
      ...cvData!,
      customTabs: cvData!.customTabs.filter(tab => tab.id !== tabId),
      tabOrder: cvData!.tabOrder.filter(id => id !== tabId)
    });
  };

  const toolOptions = [
    { value: 'VSCode', label: 'VSCode', icon: <FaGithub className="w-4 h-4 inline mr-1 text-blue-600" /> },
    { value: 'GitHub', label: 'GitHub', icon: <FaGithub className="w-4 h-4 inline mr-1 text-gray-800" /> },
    { value: 'Figma', label: 'Figma', icon: <FaDribbble className="w-4 h-4 inline mr-1 text-pink-400" /> },
    { value: 'Notion', label: 'Notion', icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" /> },
    { value: 'Slack', label: 'Slack', icon: <FaDiscord className="w-4 h-4 inline mr-1 text-indigo-500" /> },
    { value: 'Jira', label: 'Jira', icon: <FaGlobe className="w-4 h-4 inline mr-1 text-blue-600" /> },
    { value: 'Trello', label: 'Trello', icon: <FaGlobe className="w-4 h-4 inline mr-1 text-blue-400" /> },
    { value: 'Other', label: 'Other', icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" /> },
  ];

  // Now it's safe to use cvData, including in the tabs array
  // Build tabs array from tabOrder, mapping ids to built-in and custom tabs
  const builtInTabs = [
    { id: 'basics', label: 'Basic Info' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'tools', label: 'My Tools' },
    { id: 'work', label: 'Work Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'languages', label: 'Languages' },
    { id: 'coverLetters', label: 'Cover Letters' },
  ];
  const customTabsMap = Object.fromEntries(cvData.customTabs.map(tab => [tab.id, tab]));
  const tabs = cvData.tabOrder.map(id => {
    const builtIn = builtInTabs.find(t => t.id === id);
    if (builtIn) return builtIn;
    const custom = customTabsMap[id];
    if (custom) return { id: custom.id, label: custom.name };
    return { id, label: id };
  });

  const reorderTabs = (newOrder: string[]) => {
    setCvData(cvData => {
      if (!cvData) return cvData;
      const updated = { ...cvData, tabOrder: newOrder };
      // Auto-save after reordering
      saveCVData(updated);
      if (onDataChange) onDataChange();
      return updated;
    });
  };

  const renderBasicsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={cvData.basics.name}
            onChange={(e) => setCvData({...cvData!, basics: {...cvData!.basics, name: e.target.value}})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={cvData.basics.label}
            onChange={(e) => setCvData({...cvData!, basics: {...cvData!.basics, label: e.target.value}})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <FileUpload
        label="Profile Image"
        value={cvData.basics.image}
        onChange={(value, file) => setCvData({...cvData!, basics: {...cvData!.basics, image: value, imageFile: file}})}
        accept="image/*"
        type="image"
      />
      
      <FileUpload
        label="Resume"
        value={cvData.basics.resume || ''}
        onChange={(value, file) => setCvData({...cvData!, basics: {...cvData!.basics, resume: value, resumeFile: file}})}
        accept=".pdf,.doc,.docx"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Sheet DB</label>
        <input
          type="url"
          value={cvData.basics.googleSheetDb || ''}
          onChange={e => {
            const value = e.target.value;
            // Only allow Google Sheet links
            if (!value || value.match(/^https:\/\/(docs|drive)\.google\.com\/spreadsheets\//)) {
              setCvData({ ...cvData!, basics: { ...cvData!.basics, googleSheetDb: value } });
            }
          }}
          placeholder="Paste your Google Sheet link"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-gray-500 mt-1">Only Google Sheet links are accepted.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
        <textarea
          value={cvData.basics.summary}
          onChange={(e) => setCvData({...cvData!, basics: {...cvData!.basics, summary: e.target.value}})}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <CustomFieldEditor
        fields={cvData.basics.customFields}
        onFieldsChange={(fields: CustomField[]) => setCvData({...cvData!, basics: {...cvData!.basics, customFields: fields}})}
      />
    </div>
  );

  const renderContactsTab = () => {
    // Social network options with icons
    const socialNetworks = [
      { value: 'LinkedIn', label: 'LinkedIn', icon: <FaLinkedin className="w-4 h-4 inline mr-1 text-blue-600" /> },
      { value: 'GitHub', label: 'GitHub', icon: <FaGithub className="w-4 h-4 inline mr-1 text-gray-800" /> },
      { value: 'Twitter', label: 'Twitter', icon: <FaTwitter className="w-4 h-4 inline mr-1 text-blue-400" /> },
      { value: 'Facebook', label: 'Facebook', icon: <FaFacebook className="w-4 h-4 inline mr-1 text-blue-700" /> },
      { value: 'Messenger', label: 'Messenger', icon: <FaFacebookMessenger className="w-4 h-4 inline mr-1 text-blue-500" /> },
      { value: 'Instagram', label: 'Instagram', icon: <FaInstagram className="w-4 h-4 inline mr-1 text-pink-500" /> },
      { value: 'YouTube', label: 'YouTube', icon: <FaYoutube className="w-4 h-4 inline mr-1 text-red-600" /> },
      { value: 'TikTok', label: 'TikTok', icon: <FaTiktok className="w-4 h-4 inline mr-1 text-black" /> },
      { value: 'WhatsApp', label: 'WhatsApp', icon: <FaWhatsapp className="w-4 h-4 inline mr-1 text-green-500" /> },
      { value: 'Telegram', label: 'Telegram', icon: <FaTelegram className="w-4 h-4 inline mr-1 text-blue-400" /> },
      { value: 'Reddit', label: 'Reddit', icon: <FaReddit className="w-4 h-4 inline mr-1 text-orange-500" /> },
      { value: 'Discord', label: 'Discord', icon: <FaDiscord className="w-4 h-4 inline mr-1 text-indigo-500" /> },
      { value: 'Snapchat', label: 'Snapchat', icon: <FaSnapchatGhost className="w-4 h-4 inline mr-1 text-yellow-400" /> },
      { value: 'Pinterest', label: 'Pinterest', icon: <FaPinterest className="w-4 h-4 inline mr-1 text-red-500" /> },
      { value: 'Medium', label: 'Medium', icon: <FaMedium className="w-4 h-4 inline mr-1 text-green-700" /> },
      { value: 'Dribbble', label: 'Dribbble', icon: <FaDribbble className="w-4 h-4 inline mr-1 text-pink-400" /> },
      { value: 'Behance', label: 'Behance', icon: <FaBehance className="w-4 h-4 inline mr-1 text-blue-500" /> },
      { value: 'Stack Overflow', label: 'Stack Overflow', icon: <FaStackOverflow className="w-4 h-4 inline mr-1 text-orange-400" /> },
      { value: 'Other', label: 'Other', icon: <FaGlobe className="w-4 h-4 inline mr-1 text-gray-400" /> },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={cvData.contacts.email}
              onChange={(e) => setCvData({...cvData!, contacts: {...cvData!.contacts, email: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={cvData.contacts.phone}
              onChange={(e) => setCvData({...cvData!, contacts: {...cvData!.contacts, phone: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              value={cvData.contacts.url}
              onChange={(e) => setCvData({...cvData!, contacts: {...cvData!.contacts, url: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={cvData.contacts.location.city}
              onChange={(e) => setCvData({...cvData!, contacts: {...cvData!.contacts, location: {...cvData!.contacts.location, city: e.target.value}}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={cvData.contacts.location.country}
              onChange={(e) => setCvData({...cvData!, contacts: {...cvData!.contacts, location: {...cvData!.contacts.location, country: e.target.value}}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Profiles</h3>
            <button
              onClick={() => {
                const newProfile = { network: '', username: '', url: '' };
                setCvData({...cvData!, contacts: {...cvData!.contacts, profiles: [...cvData!.contacts.profiles, newProfile]}});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
          </div>
          
          <DragDropList
            items={cvData.contacts.profiles}
            onReorder={(newOrder) => setCvData({ ...cvData!, contacts: { ...cvData!.contacts, profiles: newOrder } })}
            renderItem={(profile, index) => (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Select
                    classNamePrefix="react-select"
                    value={socialNetworks.find((n) => n.value === profile.network) || null}
                    onChange={(selected) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = { ...profile, network: selected ? selected.value : '' };
                      setCvData({ ...cvData!, contacts: { ...cvData!.contacts, profiles: newProfiles } });
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
                      control: (base) => ({ ...base, minHeight: '38px' }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = { ...profile, username: e.target.value };
                      setCvData({ ...cvData!, contacts: { ...cvData!.contacts, profiles: newProfiles } });
                    }}
                    placeholder="Username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    value={profile.url}
                    onChange={(e) => {
                      const newProfiles = [...cvData.contacts.profiles];
                      newProfiles[index] = { ...profile, url: e.target.value };
                      setCvData({ ...cvData!, contacts: { ...cvData!.contacts, profiles: newProfiles } });
                    }}
                    placeholder="Profile URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const newProfiles = cvData.contacts.profiles.filter((_, i) => i !== index);
                    setCvData({ ...cvData!, contacts: { ...cvData!.contacts, profiles: newProfiles } });
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
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
            <h3 className="text-lg font-semibold text-gray-900">My Tools</h3>
            <button
              onClick={() => {
                const newTool = { name: '', username: '', url: '', customFields: [] };
                setCvData({ ...cvData!, tools: [...(cvData!.tools || []), newTool] });
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
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Select
                    classNamePrefix="react-select"
                    value={toolOptions.find((n) => n.value === tool.name) || null}
                    onChange={(selected) => {
                      const newTools = [...cvData.tools];
                      newTools[index] = { ...tool, name: selected ? selected.value : '' };
                      setCvData({ ...cvData!, tools: newTools });
                    }}
                    options={toolOptions}
                    isClearable
                    placeholder="Tool Name"
                    formatOptionLabel={(option) => (
                      <div className="flex items-center">{option.icon}<span className="ml-1">{option.label}</span></div>
                    )}
                    styles={{
                      control: (base) => ({ ...base, minHeight: '38px' }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const newTools = cvData.tools.filter((_, i) => i !== index);
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

        <CustomFieldEditor
          fields={cvData.contacts.customFields}
          onFieldsChange={(fields: CustomField[]) => setCvData({...cvData!, contacts: {...cvData!.contacts, customFields: fields}})}
        />
      </div>
    );
  };

  const renderToolsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Tools</h3>
        <button
          onClick={() => {
            const newTool = { name: '', username: '', url: '', customFields: [] };
            setCvData({ ...cvData!, tools: [...(cvData!.tools || []), newTool] });
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
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 min-w-0">
              <Select
                classNamePrefix="react-select"
                value={toolOptions.find((n) => n.value === tool.name) || null}
                onChange={(selected) => {
                  const newTools = [...cvData.tools];
                  newTools[index] = { ...tool, name: selected ? selected.value : '' };
                  setCvData({ ...cvData!, tools: newTools });
                }}
                options={toolOptions}
                isClearable
                placeholder="Tool Name"
                formatOptionLabel={(option) => (
                  <div className="flex items-center">{option.icon}<span className="ml-1">{option.label}</span></div>
                )}
                styles={{
                  control: (base) => ({ ...base, minHeight: '38px' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                const newTools = cvData.tools.filter((_, i) => i !== index);
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
      <CustomFieldEditor
        fields={[]}
        onFieldsChange={() => {}}
      />
    </div>
  );

  const renderWorkTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          onClick={() => {
            const newWork = {
              name: '',
              location: '',
              url: '',
              position: '',
              jobType: '',
              employeeType: '',
              startDate: '',
              endDate: '',
              highlights: [''],
              customFields: []
            };
            setCvData({...cvData!, work: [...cvData!.work, newWork]});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Work
        </button>
      </div>
      
      <DragDropList
        items={cvData.work}
        onReorder={(newOrder) => setCvData({...cvData!, work: newOrder})}
        renderItem={(work, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Work Experience #{index + 1}</h4>
              <button
                onClick={() => {
                  const newWork = cvData.work.filter((_, i) => i !== index);
                  setCvData({...cvData!, work: newWork});
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={work.name}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, name: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={work.position}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, position: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={work.jobType}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, jobType: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                <select
                  value={work.employeeType}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, employeeType: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee Type</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={work.location}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, location: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company URL</label>
                <input
                  type="url"
                  value={work.url}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, url: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="text"
                  value={work.startDate}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, startDate: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="text"
                  value={work.endDate || ''}
                  onChange={(e) => {
                    const newWork = [...cvData.work];
                    newWork[index] = {...work, endDate: e.target.value};
                    setCvData({...cvData!, work: newWork});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for current position"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
              {work.highlights.map((highlight: any, highlightIndex: any) => (
                <div key={highlightIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => {
                      const newWork = [...cvData.work];
                      newWork[index].highlights[highlightIndex] = e.target.value;
                      setCvData({...cvData!, work: newWork});
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newWork = [...cvData.work];
                      newWork[index].highlights = newWork[index].highlights.filter((_, i) => i !== highlightIndex);
                      setCvData({...cvData!, work: newWork});
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newWork = [...cvData.work];
                  newWork[index].highlights.push('');
                  setCvData({...cvData!, work: newWork});
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Highlight
              </button>
            </div>
            
            <CustomFieldEditor
              fields={work.customFields}
              onFieldsChange={(fields: CustomField[]) => {
                const newWork = [...cvData.work];
                newWork[index] = {...work, customFields: fields};
                setCvData({...cvData!, work: newWork});
              }}
            />
          </div>
        )}
      />
    </div>
  );

  const renderEducationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <button
          onClick={() => {
            const newEducation = {
              institution: '',
              area: '',
              studyType: '',
              startDate: '',
              endDate: '',
              score: '',
              cgpa: '',
              scale: '',
              customFields: []
            };
            setCvData({...cvData!, education: [...cvData!.education, newEducation]});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      <DragDropList
        items={cvData.education}
        onReorder={(newOrder) => setCvData({...cvData!, education: newOrder})}
        renderItem={(edu, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
              <button
                onClick={() => {
                  const newEducation = cvData.education.filter((_, i) => i !== index);
                  setCvData({...cvData!, education: newEducation});
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, institution: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Study Type</label>
                <input
                  type="text"
                  value={edu.studyType}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, studyType: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area of Study</label>
                <input
                  type="text"
                  value={edu.area}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, area: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
                <input
                  type="text"
                  value={edu.cgpa}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, cgpa: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scale</label>
                <input
                  type="text"
                  value={edu.scale}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, scale: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, startDate: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) => {
                    const newEducation = [...cvData.education];
                    newEducation[index] = {...edu, endDate: e.target.value};
                    setCvData({...cvData!, education: newEducation});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <CustomFieldEditor
              fields={edu.customFields}
              onFieldsChange={(fields: CustomField[]) => {
                const newEducation = [...cvData.education];
                newEducation[index] = {...edu, customFields: fields};
                setCvData({...cvData!, education: newEducation});
              }}
            />
          </div>
        )}
      />
    </div>
  );

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
          <button
            onClick={() => {
              const newSkill = { name: '', keywords: [''] };
              setCvData({...cvData!, skills: {...cvData!.skills, technical: [...cvData!.skills.technical, newSkill]}});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Skill Category
          </button>
        </div>

        <DragDropList
          items={cvData.skills.technical}
          onReorder={(newOrder) => setCvData({...cvData!, skills: {...cvData!.skills, technical: newOrder}})}
          renderItem={(skill, index) => (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Category</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const newSkills = [...cvData.skills.technical];
                      newSkills[index] = {...skill, name: e.target.value};
                      setCvData({...cvData!, skills: {...cvData!.skills, technical: newSkills}});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const newSkills = cvData.skills.technical.filter((_, i) => i !== index);
                    setCvData({...cvData!, skills: {...cvData!.skills, technical: newSkills}});
                  }}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                {skill.keywords.map((keyword: any, keywordIndex: any) => (
                  <div key={keywordIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => {
                        const newSkills = [...cvData.skills.technical];
                        newSkills[index].keywords[keywordIndex] = e.target.value;
                        setCvData({...cvData!, skills: {...cvData!.skills, technical: newSkills}});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newSkills = [...cvData.skills.technical];
                        newSkills[index].keywords = newSkills[index].keywords.filter((_, i) => i !== keywordIndex);
                        setCvData({...cvData!, skills: {...cvData!.skills, technical: newSkills}});
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newSkills = [...cvData.skills.technical];
                    newSkills[index].keywords.push('');
                    setCvData({...cvData!, skills: {...cvData!.skills, technical: newSkills}});
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Keyword
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodologies</h3>
        <div className="space-y-2">
          {cvData.skills.methodologies.map((methodology, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={methodology}
                onChange={(e) => {
                  const newMethodologies = [...cvData.skills.methodologies];
                  newMethodologies[index] = e.target.value;
                  setCvData({...cvData!, skills: {...cvData!.skills, methodologies: newMethodologies}});
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newMethodologies = cvData.skills.methodologies.filter((_, i) => i !== index);
                  setCvData({...cvData!, skills: {...cvData!.skills, methodologies: newMethodologies}});
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setCvData({...cvData!, skills: {...cvData!.skills, methodologies: [...cvData!.skills.methodologies, '']}});
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Methodology
          </button>
        </div>
      </div>
      
      <CustomFieldEditor
        fields={cvData.skills.customFields}
        onFieldsChange={(fields: CustomField[]) => setCvData({...cvData!, skills: {...cvData!.skills, customFields: fields}})}
      />
    </div>
  );

  const renderCertificatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Certificates</h3>
        <button
          onClick={() => {
            const newCertificate = {
              name: '',
              date: '',
              issuer: '',
              url: '',
              customFields: []
            };
            setCvData({...cvData!, certificates: [...cvData!.certificates, newCertificate]});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>
      </div>

      <DragDropList
        items={cvData.certificates}
        onReorder={(newOrder) => setCvData({...cvData!, certificates: newOrder})}
        renderItem={(cert, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Certificate #{index + 1}</h4>
              <button
                onClick={() => {
                  const newCertificates = cvData.certificates.filter((_, i) => i !== index);
                  setCvData({...cvData!, certificates: newCertificates});
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = {...cert, name: e.target.value};
                    setCvData({...cvData!, certificates: newCertificates});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = {...cert, issuer: e.target.value};
                    setCvData({...cvData!, certificates: newCertificates});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="text"
                  value={cert.date}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = {...cert, date: e.target.value};
                    setCvData({...cvData!, certificates: newCertificates});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate URL</label>
                <input
                  type="url"
                  value={cert.url}
                  onChange={(e) => {
                    const newCertificates = [...cvData.certificates];
                    newCertificates[index] = {...cert, url: e.target.value};
                    setCvData({...cvData!, certificates: newCertificates});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <CustomFieldEditor
              fields={cert.customFields}
              onFieldsChange={(fields: CustomField[]) => {
                const newCertificates = [...cvData.certificates];
                newCertificates[index] = {...cert, customFields: fields};
                setCvData({...cvData!, certificates: newCertificates});
              }}
            />
          </div>
        )}
      />
    </div>
  );

  const renderLanguagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
        <button
          onClick={() => {
            const newLanguage = {
              language: '',
              fluency: '',
              customFields: []
            };
            setCvData({...cvData!, languages: [...cvData!.languages, newLanguage]});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      <DragDropList
        items={cvData.languages}
        onReorder={(newOrder) => setCvData({...cvData!, languages: newOrder})}
        renderItem={(lang, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Language #{index + 1}</h4>
              <button
                onClick={() => {
                  const newLanguages = cvData.languages.filter((_, i) => i !== index);
                  setCvData({...cvData!, languages: newLanguages});
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => {
                    const newLanguages = [...cvData.languages];
                    newLanguages[index] = {...lang, language: e.target.value};
                    setCvData({...cvData!, languages: newLanguages});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fluency</label>
                <input
                  type="text"
                  value={lang.fluency}
                  onChange={(e) => {
                    const newLanguages = [...cvData.languages];
                    newLanguages[index] = {...lang, fluency: e.target.value};
                    setCvData({...cvData!, languages: newLanguages});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <CustomFieldEditor
              fields={lang.customFields}
              onFieldsChange={(fields: CustomField[]) => {
                const newLanguages = [...cvData.languages];
                newLanguages[index] = {...lang, customFields: fields};
                setCvData({...cvData!, languages: newLanguages});
              }}
            />
          </div>
        )}
      />
    </div>
  );

  const renderCoverLettersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Cover Letters</h3>
        <button
          onClick={() => {
            const newCoverLetter = {
              id: Date.now().toString(),
              title: `Cover Letter ${cvData.coverLetters.length + 1}`,
              content: ''
            };
            setCvData({...cvData!, coverLetters: [...cvData!.coverLetters, newCoverLetter]});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Cover Letter
        </button>
      </div>

      <DragDropList
        items={cvData.coverLetters}
        onReorder={(newOrder) => setCvData({...cvData!, coverLetters: newOrder})}
        renderItem={(coverLetter, index) => (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={coverLetter.title}
                  onChange={(e) => {
                    const newCoverLetters = [...cvData.coverLetters];
                    newCoverLetters[index] = {...coverLetter, title: e.target.value};
                    setCvData({...cvData!, coverLetters: newCoverLetters});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  const newCoverLetters = cvData.coverLetters.filter((_, i) => i !== index);
                  setCvData({...cvData!, coverLetters: newCoverLetters});
                }}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={coverLetter.content}
                onChange={(e) => {
                  const newCoverLetters = [...cvData.coverLetters];
                  newCoverLetters[index] = {...coverLetter, content: e.target.value};
                  setCvData({...cvData!, coverLetters: newCoverLetters});
                }}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateCustomTab(tab.id, { name: newTabName });
                    setEditingTabName(null);
                    setNewTabName('');
                  }
                }}
              />
              <button
                onClick={() => {
                  updateCustomTab(tab.id, { name: newTabName });
                  setEditingTabName(null);
                  setNewTabName('');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900">{tab.name}</h3>
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
      <CustomFieldEditor
        fields={tab.customFields}
        onFieldsChange={(fields: CustomField[]) => updateCustomTab(tab.id, { customFields: fields })}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basics':
        return renderBasicsTab();
      case 'contacts':
        return renderContactsTab();
      case 'tools':
        return renderToolsTab();
      case 'work':
        return renderWorkTab();
      case 'education':
        return renderEducationTab();
      case 'skills':
        return renderSkillsTab();
      case 'certificates':
        return renderCertificatesTab();
      case 'languages':
        return renderLanguagesTab();
      case 'coverLetters':
        return renderCoverLettersTab();
      default:
        const customTab = cvData.customTabs.find(tab => tab.id === activeTab);
        if (customTab) {
          return renderCustomTab(customTab);
        }
        return renderBasicsTab();
    }
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
          {/* Tab Order Card at the Top */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-md px-2 sm:px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab Order</h3>
              <DragDropList
                items={cvData.tabOrder.map(id => ({ id, label: tabs.find(t => t.id === id)?.label || id }))}
                onReorder={(newOrder) => reorderTabs(newOrder.map(item => item.id))}
                renderItem={(item) => (
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.label}</span>
                  </div>
                )}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              />
            </div>
          </section>

          {/* Dashboard Header and Tabs Card */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-md">
              {/* Header with title, view CV, save, logout */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 px-6 py-4 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <h1 className="text-2xl font-bold text-gray-900">Rony.DB Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/');
                      const navEvent = new PopStateEvent('popstate');
                      window.dispatchEvent(navEvent);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    title="View CV"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                    title="Save Changes"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 px-6 py-4 bg-white rounded-b-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-100 text-gray-800 hover:bg-blue-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={addCustomTab}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Tab
                </button>
              </div>
              {/* Tab Content */}
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
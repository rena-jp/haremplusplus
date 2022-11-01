import { useCallback } from 'react';
import '../style/tabs.css';

export interface TabFolderProps {
  tabs: Tab[];
  toggleTab(tab: Tab): void;
  activeTab: Tab | undefined;
}

export interface Tab {
  id: string;
  label: string;
}

export const TabFolder: React.FC<TabFolderProps> = ({
  tabs,
  toggleTab,
  activeTab
}) => {
  return (
    <div className="tab-folder">
      {tabs.map((tab) => (
        <TabEntry
          tab={tab}
          toggleTab={toggleTab}
          active={activeTab?.id === tab.id}
          key={tab.id}
        />
      ))}
    </div>
  );
};

interface TabEntryProps {
  tab: Tab;
  toggleTab(tab: Tab): void;
  active: boolean;
}

const TabEntry: React.FC<TabEntryProps> = ({ tab, toggleTab, active }) => {
  const onClick = useCallback(() => toggleTab(tab), [tab, toggleTab]);
  const className = `tab ${active ? 'active' : ''}`;
  return (
    <div className={className} onClick={onClick}>
      <div className="tab-label">{tab.label}</div>
    </div>
  );
};

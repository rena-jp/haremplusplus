import { ReactNode, useCallback } from 'react';
import '../style/tabs.css';
import { CloseButton } from './common';

export interface TabFolderProps {
  tabs: Tab[];
  toggleTab(tab: Tab): void;
  activeTab: Tab | undefined;
  children: ReactNode;
}

export interface Tab {
  id: string;
  label: string;
}

export const TabFolder: React.FC<TabFolderProps> = ({
  tabs,
  toggleTab,
  activeTab,
  children
}) => {
  const panelClasses = `qh-panel ${
    activeTab !== undefined ? 'visible' : 'hidden'
  }`;

  const close = useCallback(() => {
    if (activeTab !== undefined) {
      toggleTab(activeTab);
    }
  }, [activeTab, toggleTab]);

  return (
    <>
      {/* <div className="tab-folder">
        {tabs.map((tab) => (
          <TabEntry
            tab={tab}
            toggleTab={toggleTab}
            active={activeTab?.id === tab.id}
            key={tab.id}
          />
        ))}
      </div> */}
      <div className={panelClasses}>
        <div className="panel-tab-folder">
          {tabs.map((tab) => (
            <TabEntry
              tab={tab}
              toggleTab={toggleTab}
              active={activeTab?.id === tab.id}
              key={tab.id}
            />
          ))}
          <CloseButton close={close} title="Close" />
        </div>
        {children}
      </div>
    </>
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

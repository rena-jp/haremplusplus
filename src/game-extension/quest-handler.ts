import { loadAndDispatch } from './frame-utils';

export async function handleQuest(): Promise<void> {
  await handleQuestData();
  await loadAndDispatch('questData', async () => window.questData);
}

// The questData object is not exposed. Create a copy of the script
// tag to attach the questData object to the window.
async function handleQuestData(): Promise<void> {
  const allScripts = document.getElementsByTagName('script');
  for (const script of allScripts) {
    if (
      script.textContent !== null &&
      script.textContent.includes('var questData')
    ) {
      const questContent = script.textContent;
      const textToFind = 'var Q = new Quest(questData);';
      let index = questContent.indexOf(textToFind);
      if (index < 0) {
        index = questContent.indexOf('var Q  = new quest.Quest(questData);');
      }
      if (index >= 0) {
        const updatedContent =
          questContent.substring(0, index) +
          'window.setQuestData(questData);\n});';

        // Execute a script that exposes the questData value
        return new Promise((resolve) => {
          window.setQuestData = (data) => {
            window.questData = data;
            resolve();
          };
          // eslint-disable-next-line no-new-func
          Function(updatedContent)();
        });
      }
    }
  }
}

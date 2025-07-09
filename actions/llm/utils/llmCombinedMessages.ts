export const getCombinedMessages = (
  messages: { role: 'assistant' | 'user'; content: string }[]
) => {
  const combinedMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const curr = { ...messages[i] };
    if (combinedMessages.length > 0) {
      const lastItem = combinedMessages[combinedMessages.length - 1];
      if (lastItem.role === curr.role) {
        lastItem.content += `\n${curr.content}`;
      } else {
        combinedMessages.push(curr);
      }
    } else {
      combinedMessages.push(curr);
    }
  }
  return combinedMessages;
};

export async function sendToErrorGenerateBot(message: string): Promise<void> {
  try {
    const response = await fetch(process.env.ERROR_BOT_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error('Failed to send error to bot:', await response.text());
    }
  } catch (error) {
    console.error('Error sending message to bot:', error);
  }
}

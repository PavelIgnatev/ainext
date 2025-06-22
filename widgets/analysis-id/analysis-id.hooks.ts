import { useEffect, useRef, useMemo, useState, KeyboardEvent } from 'react';
import { BaseMessage, MessagePositionInGroup } from './analysis-id.types';
import { formatMessageText } from '@/utils/textFormatters';

interface UseAnalysisMessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function useAnalysisMessages(messages: BaseMessage[]) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = dialogRef.current.scrollHeight;
    }
  }, [messages]);

  const formattedMessages = useMemo<BaseMessage[]>(() => {
    return messages
      .map((message) => ({
        ...message,
        text: formatMessageText(message.text),
      }))
      .map((message, index, array) => {
        const prevMessage = array[index - 1];
        const nextMessage = array[index + 1];

        const isFirstInGroup =
          !prevMessage || prevMessage.fromId !== message.fromId;
        const isLastInGroup =
          !nextMessage || nextMessage.fromId !== message.fromId;

        let positionInGroup: MessagePositionInGroup = 'single';

        if (isFirstInGroup && !isLastInGroup) {
          positionInGroup = 'top';
        } else if (!isFirstInGroup && !isLastInGroup) {
          positionInGroup = 'middle';
        } else if (!isFirstInGroup && isLastInGroup) {
          positionInGroup = 'bottom';
        }

        return {
          ...message,
          positionInGroup,
        };
      });
  }, [messages]);

  return {
    dialogRef,
    formattedMessages,
  };
}

export function useAnalysisMessageInput({
  onSend,
  disabled = false,
}: UseAnalysisMessageInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedValue = value.trim();

    if (disabled || !trimmedValue) return;

    onSend(trimmedValue);
    setValue('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const canSend = !disabled && value.trim().length > 0;

  return {
    value,
    handleSubmit,
    handleKeyPress,
    handleChange,
    canSend,
  };
}

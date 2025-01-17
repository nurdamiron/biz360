// ----------------------------------------------------------------------

export function getMessage({ message, participants, currentEmployeeId }) {
  const sender = participants.find((participant) => participant.id === message.senderId);

  const isCurrentEmployee = message.senderId === currentEmployeeId;

  const senderDetails = isCurrentEmployee
    ? { type: 'me' }
    : { avatarUrl: sender?.avatarUrl, firstName: sender?.name?.split(' ')[0] ?? 'Unknown' };

  const hasImage = message.contentType === 'image';

  return { hasImage, me: isCurrentEmployee, senderDetails };
}

import ChatComponent from '@/components/chat';
import { ChannelType, validateUuid, type UUID } from '@elizaos/core';
import { useParams, useSearchParams } from 'react-router-dom';

export default function GroupRoute() {
  const { channelId: channelIdFromPath } = useParams<{ channelId: string }>();
  const [searchParams] = useSearchParams();
  const serverIdFromQuery = searchParams.get('serverId');

  const channelId = validateUuid(channelIdFromPath);
  const serverId = validateUuid(serverIdFromQuery || '');

  if (!channelId || !serverId) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <p>Missing channel or server information.</p>
      </div>
    );
  }

  return (
    <ChatComponent
      key={channelId}
      chatType={ChannelType.GROUP}
      contextId={channelId as UUID}
      serverId={serverId as UUID}
    />
  );
}

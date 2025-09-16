import AgentCreator from '@/components/agent-creator';

export default function AgentCreatorRoute() {
  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="min-h-full flex w-full justify-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-4xl min-w-0 bg-white rounded-md shadow-sm">
          <AgentCreator />
        </div>
      </div>
    </div>
  );
}

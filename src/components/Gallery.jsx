import JerseyCard from "./JerseyCard";

export default function Gallery({ jerseys, onJerseyClick }) {
  if (jerseys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-400 mb-2">No jerseys found</h3>
        <p className="text-sm text-zinc-600 max-w-sm">
          Try adjusting your filters or clearing them to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {jerseys.map((jersey) => (
        <JerseyCard
          key={jersey.id}
          jersey={jersey}
          onClick={onJerseyClick}
        />
      ))}
    </div>
  );
}

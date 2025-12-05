import React from 'react';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';

const AvatarShop: React.FC = () => {
  const { avatarUrl } = useThinkQuestStore();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left: Avatar Display (70%) */}
      <div className="w-3/4 bg-white p-4 flex items-center justify-center">
        {avatarUrl ? (
          <img src={`${avatarUrl}?quality=high`} className="max-h-full rounded" alt="User Avatar" />
        ) : (
          <p className="text-gray-500">Create your avatar first!</p>
        )}
      </div>

      {/* Right: Shop Placeholder (30%) */}
      <div className="w-1/4 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Avatar Shop</h2>
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Shop coming soon!
        </div>
      </div>
    </div>
  );
};

export default AvatarShop;


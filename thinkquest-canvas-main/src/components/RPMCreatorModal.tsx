import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';

// npm i @readyplayerme/rrpm-react-avatar-creator

export default function RPMCreatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: (avatarUrl: string) => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-[90vw] h-[90vh] relative">
        <AvatarCreator
          className="w-full h-full"
          subdomain="thinkquest"
          onAvatarExported={(e) => {
            useThinkQuestStore.getState().setAvatarUrl(e.data.url);
            onClose(e.data.url);
          }}
        />

      </div>
    </div>
  );
}

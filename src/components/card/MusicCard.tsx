import React from 'react';
import './MusicCard.scss';

interface MusicCardProps {
  image_url: string;
  audio_url?: string;
  video_url?: string;
  title: string;
  status: 'submitted' | 'complete' | 'error';
  onAudioClick: () => void;
  onVideoClick: () => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  image_url,
  audio_url,
  video_url,
  title,
  status,
  onAudioClick,
  onVideoClick,
}) => {
  return (
    <div className={`music-card ${status !== 'complete' ? 'loading' : ''}`}>
      <div
        className="music-card-background"
        style={{ backgroundImage: `url(${image_url})` }}
      />
      <div className="music-card-overlay">
        {status === 'submitted' ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <div className="loading-text">음악 생성 중...</div>
          </div>
        ) : (
          <>
            <h3 className="music-card-title">{title}</h3>
            <div className="music-card-controls">
              {audio_url && (
                <button
                  className="control-button audio-button"
                  onClick={onAudioClick}
                  aria-label="Play Audio"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </button>
              )}
              {video_url && (
                <button
                  className="control-button video-button"
                  onClick={onVideoClick}
                  aria-label="Play Video"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

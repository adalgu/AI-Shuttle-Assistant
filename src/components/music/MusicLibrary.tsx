import React from 'react';
import { MemoryKV, Song } from '../../types/console';
import './MusicLibrary.scss';

interface MusicLibraryProps {
  memoryKv: MemoryKV;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ memoryKv }) => {
  const renderSongs = (songs: Song[]) => {
    return (
      <div className="songs-container">
        {songs.map((song) => (
          <div key={song.id} className="song-item">
            <div className="song-title">{song.title}</div>
            <div className="song-icons">
              <a
                href={song.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon"
              >
                🖼️
              </a>
              <a
                href={song.audio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon"
              >
                🎵
              </a>
              <a
                href={song.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon"
              >
                🎬
              </a>
            </div>
            <div className="song-duration">
              {Math.floor(song.duration / 60)}:
              {String(Math.floor(song.duration % 60)).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if ('songs' in memoryKv && Array.isArray(memoryKv.songs)) {
      return renderSongs(memoryKv.songs);
    }

    return <div className="empty-message">음악 라이브러리가 비어있습니다</div>;
  };

  return (
    <div className="music-library">
      <div className="content-block-body">{renderContent()}</div>
    </div>
  );
};

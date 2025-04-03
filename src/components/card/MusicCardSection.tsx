import React from 'react';
import { MusicCard } from './MusicCard';
import './MusicCardSection.scss';

export interface MusicCardData {
  id: string;
  title: string;
  image_url: string;
  audio_url?: string;
  video_url?: string;
  status: 'submitted' | 'complete' | 'error';
}

interface MusicCardSectionProps {
  cards: MusicCardData[];
  onAudioSelect: (card: MusicCardData) => void;
  onVideoSelect: (card: MusicCardData) => void;
}

export const MusicCardSection: React.FC<MusicCardSectionProps> = ({
  cards,
  onAudioSelect,
  onVideoSelect,
}) => {
  return (
    <div className="music-card-section content-block">
      <div className="content-block-title">음악 카드</div>
      <div className="content-block-body">
        <div className="cards-container">
          {cards.length === 0 ? (
            <div className="no-cards-message">
              음악이 생성되면 여기에 카드가 표시됩니다
            </div>
          ) : (
            <div className="cards-scroll">
              {cards.map((card) => (
                <MusicCard
                  key={card.id}
                  title={card.title}
                  image_url={card.image_url}
                  audio_url={card.audio_url}
                  video_url={card.video_url}
                  status={card.status}
                  onAudioClick={() => onAudioSelect(card)}
                  onVideoClick={() => onVideoSelect(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

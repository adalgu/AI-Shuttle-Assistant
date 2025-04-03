import React from 'react';
import { Edit, Book } from 'react-feather';
import { Button } from '../button/Button';
import { LOCAL_RELAY_SERVER_URL } from '../../constants/config';
import './Header.scss';

interface HeaderProps {
  apiKey: string;
  onResetApiKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({ apiKey, onResetApiKey }) => {
  return (
    <div className="header">
      <div className="header-title">
        <Book size={28} className="header-icon" />
        <span className="app-name"> AI 셔틀 어시스턴트 by AZ2</span>
      </div>
      {/* API Key display - temporarily hidden
      <div className="header-api-key">
        {!LOCAL_RELAY_SERVER_URL && (
          <Button
            icon={Edit}
            iconPosition="end"
            buttonStyle="flush"
            label={`api key: ${apiKey.slice(0, 3)}...`}
            onClick={onResetApiKey}
          />
        )}
      </div>
      */}
    </div>
  );
};

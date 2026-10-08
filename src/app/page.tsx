"use client";

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, X } from 'lucide-react';

function ShareModal({ shareUrl, onClose }: { shareUrl: string, onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 text-center">Invite Others</h2>
        
        <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
          <QRCodeSVG value={shareUrl} size={200} />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Room Link</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    // Read the room from URL if it exists
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomName(roomParam);
    }
    setOriginUrl(window.location.origin);
  }, []);

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);

    try {
      const resp = await fetch(`/api/livekit?room=${roomName}&username=${username}`);
      const data = await resp.json();
      if (data.token) {
        setToken(data.token);
      } else {
        console.error('Failed to get token', data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  if (token) {
    const shareUrl = `${originUrl}/?room=${roomName}`;
    
    return (
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
        onDisconnected={() => setToken('')}
      >
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg transition-all"
          >
            <Share2 size={18} />
            <span className="font-medium text-sm">Share Room</span>
          </button>
        </div>
        
        {showShare && (
          <ShareModal 
            shareUrl={shareUrl} 
            onClose={() => setShowShare(false)} 
          />
        )}
        
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-white relative">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-2xl border border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Video Connect
          </h1>
          <p className="text-gray-400 mt-2">Join your next meeting securely.</p>
        </div>
        
        <form onSubmit={joinRoom} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-gray-800 px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full rounded-xl bg-gray-800 px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="e.g. daily-standup"
            />
          </div>
          
          <button
            type="submit"
            disabled={isJoining}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isJoining ? 'Connecting...' : 'Join Meeting'}
          </button>
        </form>
      </div>
    </main>
  );
}

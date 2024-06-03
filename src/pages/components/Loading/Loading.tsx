// components/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col text-white items-center justify-center text-lg font-mono font-semibold" style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <div className="text-center text-white">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden ml-10">Loading...</span>
        </div>
      </div>
    </main>
  );
};

export default Loading;

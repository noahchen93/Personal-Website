import React from 'react';

export default function CRTEffects() {
  return (
    <>
      {/* CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div 
          className="w-full h-full"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 0, 0.03) 2px,
                rgba(0, 255, 0, 0.03) 4px
              )
            `
          }}
        ></div>
      </div>

      {/* Terminal Glow Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div 
          className="w-full h-full"
          style={{
            boxShadow: 'inset 0 0 100px rgba(0, 255, 0, 0.1)'
          }}
        ></div>
      </div>
    </>
  );
}
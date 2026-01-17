import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
      onComplete: () => void;
      minDuration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, minDuration = 3000 }) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const videoRef = useRef<HTMLVideoElement>(null);
      const textRef = useRef<HTMLDivElement>(null);
      const progressRef = useRef<HTMLDivElement>(null);
      const [progress, setProgress] = useState(0);

      useEffect(() => {
            const startTime = Date.now();

            // Animate progress bar
            const progressInterval = setInterval(() => {
                  setProgress(prev => {
                        if (prev >= 100) {
                              clearInterval(progressInterval);
                              return 100;
                        }
                        return prev + 2;
                  });
            }, minDuration / 50);

            // GSAP animations
            const tl = gsap.timeline();

            // Fade in video
            tl.fromTo(videoRef.current,
                  { opacity: 0, scale: 0.8 },
                  { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
            );

            // Animate text
            tl.fromTo(textRef.current,
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
                  '-=0.3'
            );

            // Animate progress bar container
            tl.fromTo(progressRef.current,
                  { opacity: 0, scaleX: 0 },
                  { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
                  '-=0.3'
            );

            // Exit animation after minimum duration
            const exitTimeout = setTimeout(() => {
                  const elapsed = Date.now() - startTime;
                  const remaining = Math.max(0, minDuration - elapsed);

                  setTimeout(() => {
                        gsap.to(containerRef.current, {
                              opacity: 0,
                              duration: 0.5,
                              ease: 'power2.in',
                              onComplete: onComplete
                        });
                  }, remaining);
            }, minDuration);

            return () => {
                  clearInterval(progressInterval);
                  clearTimeout(exitTimeout);
                  tl.kill();
            };
      }, [onComplete, minDuration]);

      return (
            <div
                  ref={containerRef}
                  className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex flex-col items-center justify-center"
            >
                  {/* Video Container */}
                  <div ref={videoRef} className="relative mb-8">
                        <video
                              ref={videoRef}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-48 h-48 object-contain"
                        >
                              <source src="/Minimalist_line_art_1080p_202601171507.mp4" type="video/mp4" />
                        </video>
                  </div>

                  {/* Text */}
                  <div ref={textRef} className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">MeetingManager</h1>
                        <p className="text-blue-200">Carregando...</p>
                  </div>

                  {/* Progress Bar */}
                  <div ref={progressRef} className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                              className="h-full bg-white rounded-full transition-all duration-100 ease-out"
                              style={{ width: `${progress}%` }}
                        />
                  </div>

                  {/* Progress Text */}
                  <p className="text-white/60 text-sm mt-4">{progress}%</p>
            </div>
      );
};

export default LoadingScreen;

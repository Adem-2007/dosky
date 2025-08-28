// src/components/ChatInterface/StreamingMarkdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StreamingMarkdown = ({ content, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const currentIndexRef = useRef(0);
  const animationFrameRef = useRef();

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }
    
    // Reset for new content stream
    setDisplayedContent('');
    currentIndexRef.current = 0;

    const type = () => {
      const currentContent = content || '';
      if (currentIndexRef.current < currentContent.length) {
        // Add a chunk of characters for a smoother, faster effect
        const nextChunkEnd = Math.min(currentIndexRef.current + 3, currentContent.length);
        const chunk = currentContent.substring(currentIndexRef.current, nextChunkEnd);
        setDisplayedContent(prev => prev + chunk);
        currentIndexRef.current = nextChunkEnd;
        animationFrameRef.current = requestAnimationFrame(type);
      }
    };

    animationFrameRef.current = requestAnimationFrame(type);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, isStreaming]);

  // A more refined, subtle blinking cursor effect
  const streamingCursor = (
    <span className="inline-block w-[3px] h-5 bg-[#2C3A47] ml-1 animate-pulse" style={{ animationDuration: '1s' }}></span>
  );

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedContent}
      </ReactMarkdown>
      {isStreaming && streamingCursor}
    </>
  );
};

export default StreamingMarkdown;
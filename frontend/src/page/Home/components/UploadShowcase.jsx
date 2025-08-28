import React from 'react';
// Import the video file from its relative path in the src directory.
import uploadVideo from '../../../video/upload.mp4';

const UploadShowcase = () => {
  return (
    // Section with padding to create space around the content.
    <section className="py-16 sm:py-20 ">
      <div className="container mx-auto px-4">

        {/* Section Header: Title and Description */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            See It in Action
          </h2>
          <p className="text-lg text-gray-600">
            Follow the simple steps shown below to upload your document. Our platform is designed for a seamless and intuitive experience, getting you from file to analysis in just a few clicks.
          </p>
        </div>

        {/* 
          This is the container that controls the video's size and margins.
          - max-w-5xl: Sets a maximum width for the video area.
          - mx-auto: Centers the container horizontally.
          - rounded-xl / rounded-2xl: Adds rounded corners.
          - overflow-hidden: Ensures the video stays within the rounded corners.
          - shadow-2xl: Adds a more pronounced drop shadow for emphasis.
          - aspect-video: A Tailwind class that sets a 16:9 aspect ratio.
        */}
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl aspect-video">
          <video
            src={uploadVideo}
            autoPlay
            loop
            muted
            playsInline
            // The video is styled to fill its parent container completely.
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>

      </div>
    </section>
  );
};

export default UploadShowcase;
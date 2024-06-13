import React, { useEffect, useState } from 'react';
import { FaArrowDownLong } from "react-icons/fa6";

const Introduction: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check initially
    window.addEventListener('resize', handleResize); // Add resize event listener

    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isMobile ? (
        <>
          <div className="introduction-box border mt-20 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              My name is Dejny and I'm an IT student from the Czech Republic. This project is my school work that started 1st of September 2023 and ended 10th of June 2024. I hope that you will enjoy it as much as I do.
            </p>
          </div>
          <div className="introduction-box border mt-10 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              To use my app, click on the arrow or scroll, then you just navigate by clicking on the menu in the top left of your screen.
            </p>
          </div>
          <FaArrowDownLong onClick={scrollToBottom} className="text-white text-7xl mt-10 animate-bounce cursor-pointer" />
        </>
      ) : (
        <>
          <div className="introduction-box border mt-10 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              My name is Dejny and I'm an IT student from the Czech Republic. This project is my school work that started 1st of September 2023 and ended 10th of June 2024. I hope that you will enjoy it as much as I do.
            </p>
          </div>
          <div className="introduction-box border mt-10 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              To use my app, you need to scroll all the way down.
            </p>
          </div>
          <div className="introduction-box border mt-5 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              Then you just navigate by moving your cursor to the left side of your screen to show the menu.
            </p>
          </div>
          <FaArrowDownLong onClick={scrollToBottom} className="text-white text-7xl mt-10 animate-bounce cursor-pointer" />
        </>
      )}
    </>
  );
};

export default Introduction;

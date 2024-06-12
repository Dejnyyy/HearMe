import React, { useEffect, useState } from 'react';

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
            To use my app, you need to scroll all the way down. Then you just navigate by clicking on the menu in the top left of your screen.
          </p>
        </div>
        
       
        </>
      ) : (
        <>
          <div className="introduction-box border mt-20 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              My name is Dejny and I'm an IT student from the Czech Republic. This project is my school work that started 1st of September 2023 and ended 10th of June 2024. I hope that you will enjoy it as much as I do.
            </p>
          </div>
          <div className="introduction-box border mt-10 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              To use my app, you need to scroll all the way down.         </p>
          </div>
          <div className="introduction-box border mt-5 border-yellow-300 p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
            Then you just navigate by moving your cursor to the left side of your screen to show the menu.
        </p>
          </div>
        </>
      )}
    </>
  );
};

export default Introduction;

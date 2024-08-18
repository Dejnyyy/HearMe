import React, { useEffect, useState } from 'react';
import { FaArrowDownLong } from "react-icons/fa6";

const Introduction: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check initially
    window.addEventListener('resize', handleResize); // Add resize event listener

    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setScrollDirection(scrollTop > lastScrollTop ? "down" : "up");
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
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
          <div className="introduction-box border mt-20 border-white p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              My name is Dejny and I'm an IT student from the Czech Republic. This project is my school work that ended 10th of June 2024.
            </p>
          </div>
          <div className="introduction-box border mt-10 border-white p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              To use my app, click on the arrow or scroll, then you just navigate by clicking on the menu in the top left of your screen.
            </p>
          </div>
          <FaArrowDownLong onClick={scrollToBottom} className="text-white text-7xl mt-10 animate-bounce cursor-pointer" />
        </>
      ) : (
        <>
        
          <div className="introduction-box border mt-10 border-white p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg">
            <p className="font-mono text-lg">
              To use my app, you need to scroll all the way down.
            </p>
          </div>
          <div className={`introduction-box border mt-5 border-white p-4 mx-10 md:mx-20 rounded-lg text-white text-center shadow-lg ${scrollDirection === "down" ? "appear" : "disappear"}`}>
            <p className="font-mono text-lg">
              Then you just navigate by moving your cursor to the left side of your screen to show the menu.
            </p>
          </div>
          <FaArrowDownLong onClick={scrollToBottom} className="text-white text-7xl mt-10 animate-bounce cursor-pointer" />
        </>
      )}
      <style jsx>{`
        .introduction-box {
          transition: transform 1s ease-out, opacity 1s ease-out;
        }
        .appear {
          opacity: 1;
          transform: translateX(0);
        }
        .disappear {
          opacity: 0;
          transform: translateX(-100%);
        }
      `}</style>
    </>
  );
};

export default Introduction;

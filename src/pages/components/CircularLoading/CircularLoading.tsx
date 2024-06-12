import React from 'react';
import styles from './CircularLoading.module.css';

interface CircularLoadingProps {
  progress: number;
}

const CircularLoading: React.FC<CircularLoadingProps> = ({ progress }) => {
  return (
    <div className={styles.container}>
      <svg className={styles.loader} viewBox="0 0 36 36">
        <path
          className={styles.circle}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          style={{ strokeDashoffset: progress }}
        />
      </svg>
    </div>
  );
};

export default CircularLoading;

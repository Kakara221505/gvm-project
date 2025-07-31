import React, { useState, useEffect } from 'react';

const OtpTimer = ({ initialTime = 60, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeout();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeout]);

  return (
    <div>
      <p className='yellowText'>Time left: {timeLeft} seconds</p>
    </div>
  );
};

export default OtpTimer;

import React, { useEffect, useState } from 'react';

const RedirectPage = () => {
  const [countdown, setCountdown] = useState(5);
  // const { search } = window.location;
  const params = new URLSearchParams(window.location.href);
  // console.log(params.get('t'), params.get('r'));
  // 获取参数（网页1、5、7、8）
  const displayText = params.get('t') || "默认显示文字";
  const redirectUrl = params.get('r');

  useEffect(() => {
    if (!redirectUrl) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      window.location.href = decodeURIComponent(redirectUrl); // 网页10
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer); // 网页9
    };
  }, [redirectUrl]);

  return (
    <div style={styles.container}>
      <h1>{decodeURIComponent(displayText)}</h1>
      {redirectUrl && (
        <p style={styles.countdown}>
          {countdown}秒后自动跳转到：
          <a href={decodeURIComponent(redirectUrl)} style={styles.link}>
            {decodeURIComponent(redirectUrl)}
          </a>
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    fontFamily: 'Arial, sans-serif'
  },
  countdown: {
    color: '#666',
    marginTop: '20px'
  },
  link: {
    color: '#007bff',
    wordBreak: 'break-all'
  }
};

export default RedirectPage;
import React, { useState, useRef } from 'react';

// Dummy image URL for replacement
const DUMMY_REPLACED_IMAGE_URL = 'https://upload.moonchan.xyz/api/01LLWEUU3J2AHXX67YXND2IMAONMR755IE/image.png';

// --- Reusable Styles (can be moved to a <style> tag in index.html or kept here for true single file JSX) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the start for scrolling
    minHeight: '100vh', // Ensure it takes at least full viewport height
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
  },
  imageUploadBox: {
    width: '90%',
    maxWidth: '400px',
    aspectRatio: '1 / 1', // Maintain a square aspect ratio
    border: '2px dashed #ccc',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'filter 0.5s ease-in-out',
    marginBottom: '20px',
  },
  imageUploadBoxBlurred: {
    filter: 'blur(8px)',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain', // Ensures the whole image is visible
    display: 'block',
  },
  uploadPlaceholder: {
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#aa0000',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
    margin: '5px',
    minWidth: '150px', // Ensure buttons have a decent minimum width
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column', // Stack buttons vertically on mobile
    alignItems: 'center', // Center buttons in the column
    marginTop: '20px',
  },
  appGridContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#e9e9e9', // Different background for this "page"
    minHeight: '100vh',
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', // Responsive grid
    gap: '20px',
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
  },
  appIcon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    textAlign: 'center',
    minHeight: '80px', // Ensure icons have a minimum height
  },
  appIconSymbol: {
    fontSize: '24px',
    marginBottom: '5px',
  },
  appIconLabel: {
    fontSize: '12px',
    color: '#333',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: '20px',
    backgroundColor: '#6c757d',
  },
  hiddenInput: {
    display: 'none',
  },
};

// Simple list of dummy apps for the "Try Another" screen
const dummyApps = [
  { id: 'app1', name: '游览宠物图片', icon: '🖼️' },
  { id: 'app2', name: '聆听宠物心声', icon: '🎵' },
  { id: 'app3', name: '我的家园', icon: '☀️' },
  { id: 'app4', name: '生成你的二次元魂兽', icon: '🗺️' },
  { id: 'app5', name: '上传宠物图片', icon: '📷' },
  { id: 'app6', name: '上传人设', icon: '🐱‍👓' },
];

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(null);
  const [showAppGrid, setShowAppGrid] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setDisplayedImage(reader.result); // Initially display the uploaded image
        setIsConverted(false); // Reset conversion state
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleConvertClick = () => {
    if (!uploadedImage) return;

    setIsProcessing(true);

    // Simulate blur and processing delay
    setTimeout(() => setDisplayedImage(DUMMY_REPLACED_IMAGE_URL), 500) // Replace with dummy image
    setTimeout(() => {
      setIsProcessing(false);
      setIsConverted(true);
    }, 1500); // 1.5 seconds delay
  };

  const handleShareClick = () => {
    // Implement sharing logic (e.g., navigator.share API if available, or simple alert)
    if (navigator.share) {
      navigator.share({
        title: 'Check out this image!',
        text: 'I transformed an image.',
        url: displayedImage, // Or a link to where the image is hosted
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert(`Sharing image: ${displayedImage}\n(Share functionality placeholder)`);
    }
  };

  const handleTryAnotherClick = () => {
    setShowAppGrid(true);
  };

  const handleBackToMain = () => {
    setShowAppGrid(false);
    // Optionally reset the main page state
    setUploadedImage(null);
    setDisplayedImage(null);
    setIsConverted(false);
    setIsProcessing(false);
  };

  const handleAppIconClick = (appName) => {
    alert(`Opening ${appName}... (This is a demo)`);
    // Here you could navigate or perform an action specific to the app
    // For now, just go back to main
    handleBackToMain();
  }

  if (showAppGrid) {
    return (
      <div style={styles.appGridContainer}>
        <button
          style={{ ...styles.button, ...styles.backButton }}
          onClick={handleBackToMain}
        >
          ← Back
        </button>
        <h2>Try Something Else</h2>
        <div style={styles.appGrid}>
          {dummyApps.map(app => (
            <div key={app.id} style={styles.appIcon} onClick={() => handleAppIconClick(app.name)}>
              <span style={styles.appIconSymbol}>{app.icon}</span>
              <span style={styles.appIconLabel}>{app.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={{
    fontSize: '26px',

      }}>生成你的二次元魂兽</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        style={styles.hiddenInput}
      />

      <div
        style={{
          ...styles.imageUploadBox,
          ...(isProcessing ? styles.imageUploadBoxBlurred : {}),
        }}
        onClick={!displayedImage ? triggerFileUpload : undefined} // Allow click to upload only if no image
      >
        {displayedImage ? (
          <img src={displayedImage} alt="Preview" style={styles.imagePreview} />
        ) : (
          <div style={styles.uploadPlaceholder}>
            <p>点击上传图片</p>
            <p style={{ fontSize: '30px' }}>🖼️</p>
          </div>
        )}
      </div>

      {!isConverted && (
        <button style={styles.button} onClick={handleConvertClick} disabled={!(uploadedImage && !isProcessing)}>
          生成你的守护神兽
        </button>
      )}

      {isProcessing && (
        <p>Processing...</p>
      )}

      {isConverted && (
        <div style={styles.buttonGroup}>
          <p>你的守护神兽是这只充满活力和好奇的松鼠，它象征着机智、敏捷和积极进取。它的存在表明你在生活中需要更多的灵活性和适应性，同时也提醒你要善于发现和抓住机会。松鼠在花丛中嬉戏，代表着在美好的环境中寻找乐趣和成长。它的笑容传递出一种积极向上的能量，鼓励你保持乐观的心态，勇敢面对挑战。</p>
          <button style={styles.button} onClick={()=>{
            window.open(`https://service.weibo.com/share/share.php?url=nft.work.place&title=我在xxx网生成了我的魂兽，你也来试试吧&pic=${DUMMY_REPLACED_IMAGE_URL}`, '_blank')
          }}>
            分享到微博
          </button>
          <button style={{ ...styles.button, backgroundColor: '#28a745' }} onClick={handleTryAnotherClick}>
            试试别的
          </button>
        </div>
      )}

      {/* Allow re-uploading even after conversion */}
      {/* {isConverted && (
        <button
          style={{ ...styles.button, backgroundColor: '#6c757d', marginTop: '20px' }}
          onClick={() => {
            setUploadedImage(null);
            setDisplayedImage(null);
            setIsConverted(false);
            triggerFileUpload();
          }}
        >
          Upload New Image
        </button>
      )} */}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';

const StPaddysBarCrawl = () => {
  // All bar data from the images
  const allBars = [
    { name: "ROCBAR", address: "25 W Hubbard St", hours: "5-8pm", isBonus: false, streetGroup: "Hubbard" },
    { name: "Electric Hotel", address: "222 W Ontario St", hours: "12pm-6pm", isBonus: false, streetGroup: "Ontario" },
    { name: "Joy District", address: "112 W Hubbard St", hours: "12-10pm", isBonus: false, streetGroup: "Hubbard" },
    { name: "Hubbard Inn", address: "110 W Hubbard St", hours: "12-10pm", isBonus: false, streetGroup: "Hubbard" },
    { name: "Point and Feather", address: "113 W Hubbard St", hours: "4-7pm", isBonus: false, streetGroup: "Hubbard" },
    { name: "Rino Bar", address: "642 N Clark St", hours: "12-10pm", isBonus: false, streetGroup: "Clark" },
    { name: "Tunnel", address: "151 W Kinzie St", hours: "12-10pm", isBonus: false, streetGroup: "Kinzie" },
    { name: "Moes Cantina", address: "155 W Kinzie St", hours: "12-10pm", isBonus: false, streetGroup: "Kinzie" },
    { name: "Liqrbox", address: "873 N Orleans St", hours: "12-10pm", isBonus: false, streetGroup: "Orleans" },
    { name: "Tao", address: "632 N Dearborn St", hours: "3-7pm", isBonus: false, streetGroup: "Dearborn" },
    { name: "Gold Coast Social", address: "7 W Division St", hours: "12-10pm", isBonus: true, streetGroup: "Division" },
    { name: "Primary", address: "5 W Division St", hours: "12-10pm", isBonus: true, streetGroup: "Division" },
    { name: "Galeria", address: "9 W Division St", hours: "12-10pm", isBonus: true, streetGroup: "Division" },
    { name: "Disco Pancake", address: "1155 N Wells St", hours: "12-10pm", isBonus: true, streetGroup: "Wells" },
    { name: "Treehouse", address: "149 W Kinzie St", hours: "7-10pm", isBonus: false, streetGroup: "Kinzie" },
    { name: "Fame", address: "157 W Ontario St", hours: "12-10pm", isBonus: false, streetGroup: "Ontario" },
    { name: "Lore", address: "157 W Ontario St", hours: "12-10pm", isBonus: false, streetGroup: "Ontario" },
    { name: "Bodega", address: "407 N Clark St", hours: "12-10pm", isBonus: false, streetGroup: "Clark" },
    { name: "Red Room", address: "613 N Wells", hours: "12-10pm", isBonus: false, streetGroup: "Wells" },
    { name: "Headquarters", address: "213 W Institute Pl", hours: "12-10pm", isBonus: false, streetGroup: "Institute" },
    { name: "Barrio", address: "407 N Clark St", hours: "12-10pm", isBonus: false, streetGroup: "Clark" },
    { name: "Yours Truly", address: "613 N Wells", hours: "12-10pm", isBonus: false, streetGroup: "Wells" }
  ];

  const [currentTime, setCurrentTime] = useState(new Date());
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedHour, setSimulatedHour] = useState(new Date().getHours());
  const [viewMode, setViewMode] = useState('time'); // 'time', 'street', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Update current time every minute if not in simulation mode
  useEffect(() => {
    let timer;
    if (!simulationActive) {
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [simulationActive]);

  // Get user's current location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Check if a bar is currently open
  const isBarOpen = (hoursString) => {
    // Extract hours information
    const match = hoursString.match(/(\d+)(?:am|pm)?-(\d+)(?:am|pm)?/);
    if (!match) return false;
    
    let [_, startHour, endHour] = match;
    startHour = parseInt(startHour);
    endHour = parseInt(endHour);
    
    // Adjust for PM hours (assuming all end times are PM)
    if (startHour < 12 && hoursString.includes('pm')) startHour += 12;
    if (endHour < 12) endHour += 12;
    
    const now = simulationActive ? simulatedHour : currentTime.getHours();
    
    return now >= startHour && now < endHour;
  };

  // Calculate how soon a bar will open
  const timeUntilOpen = (hoursString) => {
    const match = hoursString.match(/(\d+)(?:am|pm)?-(\d+)(?:am|pm)?/);
    if (!match) return null;
    
    let [_, startHour] = match;
    startHour = parseInt(startHour);
    
    // Adjust for PM hours
    if (startHour < 12 && hoursString.includes('pm')) startHour += 12;
    
    const now = simulationActive ? simulatedHour : currentTime.getHours();
    
    if (now < startHour) {
      return startHour - now;
    }
    return null; // Already open or closed for the day
  };

  // Calculate how soon a bar will close
  const timeUntilClose = (hoursString) => {
    const match = hoursString.match(/(\d+)(?:am|pm)?-(\d+)(?:am|pm)?/);
    if (!match) return null;
    
    let [_, __, endHour] = match;
    endHour = parseInt(endHour);
    
    // Adjust for PM hours (assuming all end times are PM)
    if (endHour < 12) endHour += 12;
    
    const now = simulationActive ? simulatedHour : currentTime.getHours();
    
    if (now < endHour && isBarOpen(hoursString)) {
      return endHour - now;
    }
    return null; // Already closed or not open yet
  };

  // Get opening hour from the hours string
  const getOpeningHour = (hoursString) => {
    const match = hoursString.match(/(\d+)(?:am|pm)?-(\d+)(?:am|pm)?/);
    if (!match) return 12; // Default to noon if format isn't recognized
    
    let startHour = parseInt(match[1]);
    
    // Adjust for PM hours
    if (startHour < 12 && hoursString.includes('pm')) startHour += 12;
    
    return startHour;
  };

  // Filter bars based on current view mode and search term
  const getFilteredBars = () => {
    let filtered = [...allBars];
    
    if (searchTerm) {
      filtered = filtered.filter(bar => 
        bar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bar.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (viewMode === 'time') {
      // Sort by opening time
      filtered.sort((a, b) => {
        const aOpeningHour = getOpeningHour(a.hours);
        const bOpeningHour = getOpeningHour(b.hours);
        
        // Primary sort by opening hour
        if (aOpeningHour !== bOpeningHour) {
          return aOpeningHour - bOpeningHour;
        }
        
        // If opening hours are the same, sort by open status
        const aOpen = isBarOpen(a.hours);
        const bOpen = isBarOpen(b.hours);
        
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
        
        // If both open or both closed with same opening hour, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    } else if (viewMode === 'street') {
      // Group by street
      filtered.sort((a, b) => a.streetGroup.localeCompare(b.streetGroup));
    }
    
    return filtered;
  };

  // Get bar status emoji and description
  const getBarStatus = (bar) => {
    if (isBarOpen(bar.hours)) {
      const closingIn = timeUntilClose(bar.hours);
      return {
        emoji: "🍻",
        status: "OPEN",
        message: closingIn === 1 ? "Closing in 1 hour!" : closingIn > 1 ? `Closing in ${closingIn} hours` : "Closing soon!"
      };
    } else {
      const openingIn = timeUntilOpen(bar.hours);
      if (openingIn === null) {
        return { emoji: "🚫", status: "CLOSED", message: "Closed for today" };
      } else {
        return { 
          emoji: "⏰", 
          status: "COMING UP", 
          message: openingIn === 1 ? "Opens in 1 hour!" : `Opens in ${openingIn} hours`
        };
      }
    }
  };

  // Get random festive emoji for each bar
  const getFestiveEmoji = (barName) => {
    const emojis = ["☘️", "🍀", "🇮🇪", "🌈", "🍺", "🍻", "🥃", "🎭", "🎉", "🎊"];
    const index = barName.length % emojis.length;
    return emojis[index];
  };

  // Get map link based on platform (iOS vs other)
  const getMapLink = (bar) => {
    const address = encodeURIComponent(bar.name + ' ' + bar.address);
    
    // Check if user is on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      // Apple Maps format
      return `maps://maps.apple.com/?q=${address}`;
    } else {
      // Google Maps for Android and other platforms
      return `https://maps.google.com/?q=${address}`;
    }
  };

  // Handle time simulation changes
  const toggleSimulation = () => {
    if (simulationActive) {
      // Return to real time
      setSimulationActive(false);
      setCurrentTime(new Date());
    } else {
      // Start simulation with current hour
      setSimulationActive(true);
      setSimulatedHour(new Date().getHours());
    }
  };

  const updateSimulatedTime = (hour) => {
    setSimulatedHour(parseInt(hour));
  };

  // Format time display
  const getTimeDisplay = () => {
    if (simulationActive) {
      // Format 24-hour time to 12-hour display
      const hour12 = simulatedHour % 12 || 12;
      const ampm = simulatedHour >= 12 ? 'PM' : 'AM';
      return `${hour12}:00 ${ampm}`;
    } else {
      return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className={`app-container ${simulationActive ? 'simulation-active' : ''}`}>
      <div className="app-header">
        <h1>☘️ St. Paddy's Day Bar Crawl</h1>
        <h2>A Nichlomajujoecob Special</h2>
        <div 
          className={`time-display ${simulationActive ? 'simulated' : ''}`}
          onClick={() => setSimulationActive(!simulationActive)}
        >
          <div className="current-time">
            {getTimeDisplay()}
            <span className="time-chevron">▼</span>
          </div>
          <div className="date">
            {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        {simulationActive && (
          <div className="simulation-controls">
            <input
              type="range"
              min="0"
              max="23"
              value={simulatedHour}
              onChange={(e) => updateSimulatedTime(e.target.value)}
              className="time-slider"
            />
            <div className="hour-markers">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
            <button 
              className="reset-time-btn"
              onClick={() => {
                setSimulatedHour(new Date().getHours());
              }}
            >
              Reset to Current Time
            </button>
          </div>
        )}
      </div>
      
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search bars or streets..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="view-toggles">
        <button 
          className={`toggle-btn ${viewMode === 'time' ? 'active' : ''}`}
          onClick={() => setViewMode('time')}
        >
          <span>⏰</span> By Time
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'street' ? 'active' : ''}`}
          onClick={() => setViewMode('street')}
        >
          <span>🗺️</span> By Street
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          <span>📋</span> List All
        </button>
      </div>

      <div>
        {viewMode === 'street' && (
          <div className="view-description mb-2 text-sm text-gray-500">
            Bars grouped by street for easier navigation
          </div>
        )}
        
        {viewMode === 'time' && (
          <div className="view-description">
            Bars ordered by opening time (earliest first)
          </div>
        )}
        
        {getFilteredBars().map((bar, index) => {
          const status = getBarStatus(bar);
          let lastStreet = index === 0 ? '' : getFilteredBars()[index-1].streetGroup;
          const showStreetDivider = viewMode === 'street' && bar.streetGroup !== lastStreet;
          
          // Check if we need a time divider (for time view)
          let showTimeDivider = false;
          if (viewMode === 'time' && index > 0) {
            const currentOpeningHour = getOpeningHour(bar.hours);
            const prevOpeningHour = getOpeningHour(getFilteredBars()[index-1].hours);
            showTimeDivider = currentOpeningHour !== prevOpeningHour;
          }
          
          // Format the opening time divider
          const formatOpeningTime = (hour) => {
            const hour12 = hour % 12 || 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            return `${hour12}:00 ${ampm}`;
          };
          
          return (
            <React.Fragment key={`${bar.name}-${bar.address}`}>
              {/* Street divider for street view */}
              {showStreetDivider && (
                <div className="street-group">
                  <span>{bar.streetGroup} Street Area</span> 📍
                </div>
              )}
              
              {/* Time divider for time view */}
              {showTimeDivider && viewMode === 'time' && (
                <div className="time-group">
                  <div className="time-group-hour">{formatOpeningTime(getOpeningHour(bar.hours))}</div>
                  <div className="time-group-line"></div>
                </div>
              )}
              
              {/* First bar in time view gets a time header */}
              {viewMode === 'time' && index === 0 && (
                <div className="time-group">
                  <div className="time-group-hour">{formatOpeningTime(getOpeningHour(bar.hours))}</div>
                  <div className="time-group-line"></div>
                </div>
              )}
              
              <div className={`bar-card ${bar.isBonus ? 'bonus' : ''}`}>
                <div className="bar-header">
                  <div>
                    <h3 className="bar-name">
                      <span className="bar-emoji">{getFestiveEmoji(bar.name)}</span> {bar.name} 
                      {bar.isBonus && <span className="bonus-tag">BONUS</span>}
                    </h3>
                    <p className="bar-address">{bar.address}</p>
                  </div>
                  <div className={`status-pill ${status.status === 'OPEN' ? 'open' : status.status === 'CLOSED' ? 'closed' : 'soon'}`}>
                    <span className="status-emoji">{status.emoji}</span>
                    {status.status}
                  </div>
                </div>
                
                <div className="bar-details">
                  <span className="hours">
                    <span className="hours-icon">🕒</span> {bar.hours}
                  </span>
                  <span className="status-message">
                    {status.message}
                  </span>
                </div>
                
                <div className="action-buttons">
                  <a 
                    href={getMapLink(bar)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn map"
                  >
                    <span className="action-btn-icon">🗺️</span> Directions
                  </a>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(bar.name + ' ' + bar.address)}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn info"
                  >
                    <span className="action-btn-icon">ℹ️</span> Info
                  </a>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {getFilteredBars().length === 0 && (
          <div className="empty-state">
            <p>No bars match your search! 🤔</p>
          </div>
        )}
      </div>
      
      <div className="footer">
        <p>If you're reading this please don't let me black out (too many times)</p>
      </div>
      
      {/* Add the floating shamrocks */}
      <div className="floating-shamrock shamrock1">☘️</div>
      <div className="floating-shamrock shamrock2">☘️</div>
      <div className="floating-shamrock shamrock3">☘️</div>
    </div>
  );
};

export default StPaddysBarCrawl;
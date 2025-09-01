'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, 
  X, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Newspaper, 
  Youtube, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Sparkles,
  Filter,
  Eye,
  Share,
  Play,
  CalendarPlus,
  Bookmark,
  BookmarkPlus
} from 'lucide-react';
import { CircularProgress, Backdrop, Chip, Modal, Box, Snackbar, Alert } from '@mui/material';

// Utility function to format dates as "time ago" strings
const formatTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};

// Format date for Google Calendar
const formatDateForGoogleCalendar = (date) => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

// Generate Google Calendar URL
const generateGoogleCalendarUrl = (item) => {
  const startDate = new Date(item.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2-hour event
  
  const baseUrl = 'https://calendar.google.com/calendar/r/eventedit';
  const params = new URLSearchParams({
    text: item.title,
    dates: `${formatDateForGoogleCalendar(startDate)}/${formatDateForGoogleCalendar(endDate)}`,
    details: item.description,
    location: item.location || 'TBD',
    sf: true,
    output: 'xml'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Reusable Message Box component
const Toast = ({ message, type, onClose }) => {
  const colors = {
    success: 'bg-emerald-500/90 backdrop-blur-sm',
    error: 'bg-rose-500/90 backdrop-blur-sm',
    info: 'bg-blue-500/90 backdrop-blur-sm'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 right-6 ${colors[type]} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50`}
    >
      <CheckCircle size={20} className="flex-shrink-0" />
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Custom Loading Spinner
const LoadingState = () => (
  <Backdrop
    open={true}
    sx={{ 
      color: '#fff', 
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)'
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="relative">
        <CircularProgress 
          size={80} 
          thickness={3}
          sx={{ 
            color: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            position: 'relative'
          }} 
        />
        <Sparkles className="absolute inset-0 m-auto text-purple-500" size={32} />
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text "
      >
        Loading latest content...
      </motion.p>
    </motion.div>
  </Backdrop>
);

// Empty State Component
const EmptyState = ({ searchTerm }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full text-center py-16"
  >
    <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6">
      <Search size={48} className="text-purple-400" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">
      {searchTerm ? "No results found" : "Nothing to show yet"}
    </h3>
    <p className="text-gray-500 text-lg">
      {searchTerm 
        ? "Try adjusting your search terms or filters"
        : "Check back later for new events and updates"
      }
    </p>
  </motion.div>
);

// Detail Modal Component
const DetailModal = ({ item, open, onClose, onAddToCalendar, onBookmark, isBookmarked }) => {
  const EventTypeIconMap = {
    'Event': Users,
    'News': Newspaper,
    'Video': Youtube,
  };

  const typeColors = {
    'Event': 'from-blue-500 to-cyan-500',
    'News': 'from-purple-500 to-pink-500',
    'Video': 'from-red-500 to-orange-500'
  };

  const IconComponent = EventTypeIconMap[item.type] || Sparkles;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="detail-modal-title"
      aria-describedby="detail-modal-description"
    >
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '24px',
          boxShadow: 24,
          p: 0,
        }}
      >
        <div className={`bg-gradient-to-r ${typeColors[item.type]} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <IconComponent size={24} className="text-white" />
              </div>
              <span className="text-white/90 font-semibold text-sm uppercase tracking-wide">
                {item.type}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onBookmark(item)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
              >
                {isBookmarked ? <Bookmark size={18} className="text-white" /> : <BookmarkPlus size={18} className="text-white" />}
              </button>
              {item.type === 'Event' && (
                <a
                  href={generateGoogleCalendarUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  title="Add to Google Calendar"
                  onClick={onAddToCalendar}
                >
                  <CalendarPlus size={18} className="text-white" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                title="Close"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>
          
          <h2 id="detail-modal-title" className="text-2xl font-bold text-white">
            {item.title}
          </h2>
          
          <div className="flex items-center gap-4 mt-4 text-white/90">
            <span className="flex items-center gap-1.5 text-sm">
              <Clock size={16} />
              {formatTimeAgo(item.date)}
            </span>
            {item.location && (
              <span className="flex items-center gap-1.5 text-sm">
                <MapPin size={16} />
                {item.location}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <p id="detail-modal-description" className="text-gray-700 mb-6 leading-relaxed">
            {item.description}
          </p>
          
          {item.details && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Details</h3>
              <p className="text-gray-600">{item.details}</p>
            </div>
          )}
          
          <div className="flex gap-3 mt-6 flex-wrap">
            {item.type === 'Event' && (
              <>
                {item.registrationLink && (
                  <a
                    href={item.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Register Now
                  </a>
                )}
              </>
            )}
            {item.type === 'Video' && item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play size={18} />
                Watch Video
              </a>
            )}
            <button 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

// Content Card Component
const ContentCard = ({ item, onShare, onViewDetails, onBookmark, isBookmarked }) => {
  const EventTypeIconMap = {
    'Event': Users,
    'News': Newspaper,
    'Video': Youtube,
  };

  const typeColors = {
    'Event': 'from-blue-500 to-cyan-500',
    'News': 'from-purple-500 to-pink-500',
    'Video': 'from-red-500 to-orange-500'
  };

  const IconComponent = EventTypeIconMap[item.type] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${typeColors[item.type]} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <IconComponent size={24} className="text-white" />
            </div>
            <span className="text-white/90 font-semibold text-sm uppercase tracking-wide">
              {item.type}
            </span>
          </div>
          <div className="flex gap-2"> {/* Container for action buttons */}
            <button
              onClick={() => onBookmark(item)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
            >
              {isBookmarked ? <Bookmark size={18} className="text-white" /> : <BookmarkPlus size={18} className="text-white" />}
            </button>
            {item.type === 'Event' && (
              <a
                href={generateGoogleCalendarUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus size={18} className="text-white" />
              </a>
            )}
            <button
              onClick={() => onShare(item)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              title="Share"
            >
              <Share size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
          {item.title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {formatTimeAgo(item.date)}
            </span>
            {item.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={16} />
                {item.location}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {item.type === 'Event' && item.registrationLink ? (
            <a
              href={item.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-center"
            >
              Register Now
            </a>
          ) : item.type === 'Video' && item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Watch Video
            </a>
          ) : (
            <button 
              onClick={() => onViewDetails(item)}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              View Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function ModernEventsNews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const itemsPerPage = 8;

  const [eventsData, setEventsData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [videosData, setVideosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load bookmarks from localStorage on initial render
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('bookmarkedItems');
      if (storedBookmarks) {
        setBookmarkedItems(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Failed to load bookmarks from localStorage", e);
    }
  }, []);

  // Sync bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bookmarkedItems', JSON.stringify(bookmarkedItems));
    } catch (e) {
      console.error("Failed to save bookmarks to localStorage", e);
    }
  }, [bookmarkedItems]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, newsRes, videosRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/new'),
          fetch('/api/video')
        ]);

        if (!eventsRes.ok || !newsRes.ok || !videosRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const events = await eventsRes.json();
        const news = await newsRes.json();
        const videos = await videosRes.json();
        
        setEventsData(Array.isArray(events) ? events : []);
        setNewsData(Array.isArray(news) ? news : []);
        setVideosData(Array.isArray(videos) ? videos : []);
      } catch (err) {
        setError(err.message);
        setToast({ message: 'Failed to load content', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine and process data
  const combinedData = useMemo(() => {
    const processData = (data, type, dateField = 'date') => 
      data
        .filter(item => item[dateField])
        .map(item => ({
          ...item,
          date: new Date(item[dateField]),
          type,
        }));

    return [
      ...processData(eventsData, 'Event'),
      ...processData(newsData, 'News'),
      ...processData(videosData, 'Video', 'createdAt')
    ];
  }, [eventsData, newsData, videosData]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    return combinedData
      .filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || item.type === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date - a.date);
  }, [combinedData, searchTerm, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems, itemsPerPage]);

  // Handlers
  const handleShare = async (item) => {
    const shareUrl = `${window.location.origin}/item/${item.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setToast({ message: 'Share operation failed', type: 'error' });
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setToast({ message: 'Link copied to clipboard', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to copy link', type: 'error' });
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCalendar = () => {
    setToast({ message: 'Opening Google Calendar', type: 'info' });
  };
  
  const handleBookmark = (item) => {
    setBookmarkedItems(prevBookmarks => {
      const isBookmarked = prevBookmarks.includes(item.id);
      let newBookmarks;
      if (isBookmarked) {
        newBookmarks = prevBookmarks.filter(id => id !== item.id);
        setToast({ message: 'Bookmark removed!', type: 'info' });
      } else {
        newBookmarks = [...prevBookmarks, item.id];
        setToast({ message: 'Item bookmarked!', type: 'success' });
      }
      return newBookmarks;
    });
  };

  const uniqueTypes = [...new Set(combinedData.map(item => item.type))];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X size={48} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {isLoading && <LoadingState />}
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Your Events and News Feed
              </h1>
              <p className="text-gray-600">Stay updated with events, news, and videos</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[300px]">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, news, videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full sm:w-48 pl-4 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 appearance-none transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="">All Content</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Total Items</p>
                <p className="text-3xl font-bold text-gray-800">{combinedData.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Sparkles size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Events</p>
                <p className="text-3xl font-bold text-gray-800">{eventsData.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Videos</p>
                <p className="text-3xl font-bold text-gray-800">{videosData.length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-2xl">
                <Youtube size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${selectedType}-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
          >
            {paginatedItems.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                onShare={handleShare}
                onViewDetails={handleViewDetails}
                onBookmark={handleBookmark}
                isBookmarked={bookmarkedItems.includes(item.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredItems.length === 0 && !isLoading && (
          <EmptyState searchTerm={searchTerm} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-2xl font-semibold transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          open={modalOpen} 
          onClose={handleCloseModal}
          onAddToCalendar={handleAddToCalendar}
          onBookmark={handleBookmark}
          isBookmarked={bookmarkedItems.includes(selectedItem.id)}
        />
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
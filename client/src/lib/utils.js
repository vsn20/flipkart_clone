// Format price to Indian currency
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Calculate discount percentage
export const calcDiscount = (price, mrp) => {
  return Math.round(((mrp - price) / mrp) * 100);
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get star array for rating display
export const getStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) stars.push('full');
  if (hasHalf) stars.push('half');
  while (stars.length < 5) stars.push('empty');

  return stars;
};

// Format review count
export const formatReviewCount = (count) => {
  if (count >= 100000) return `${(count / 100000).toFixed(1)}L`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
};

// Generate order number
export const generateOrderNumber = () => {
  return `FK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

// Get delivery date (3-5 days from now)
export const getDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 3);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: '#ff9800',
    confirmed: '#2196f3',
    shipped: '#9c27b0',
    delivered: '#4caf50',
    cancelled: '#f44336',
  };
  return colors[status] || '#666';
};

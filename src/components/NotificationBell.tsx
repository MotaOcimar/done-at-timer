import { useNotification } from '../hooks/useNotification';

const NotificationBell = () => {
  const { permission, requestPermission } = useNotification();

  if (permission === 'unsupported') {
    return null;
  }

  const handleClick = () => {
    if (permission === 'default') {
      requestPermission();
    }
  };

  const getTitle = () => {
    if (permission === 'granted') return 'Notifications Enabled';
    if (permission === 'denied') return 'Notifications Blocked';
    return 'Enable Notifications';
  };

  return (
    <button
      onClick={handleClick}
      title={getTitle()}
      className={`p-2 rounded-full transition-all duration-300 ${
        permission === 'granted'
          ? 'bg-green-100 text-green-600'
          : permission === 'denied'
            ? 'bg-red-100 text-red-600'
            : 'bg-white/20 text-white hover:bg-white/30'
      }`}
      aria-label={getTitle()}
    >
      {permission === 'granted' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248 9.72 9.72 0 0 0-2.349-4.876Z" />
          <path
            fillRule="evenodd"
            d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0c.002.033.002.066.002.1a2.25 2.25 0 1 1-4.5 0Z"
            clipRule="evenodd"
          />
        </svg>
      ) : permission === 'denied' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c.767.283 1.55.53 2.349.741a.75.75 0 0 1-.405 1.446 24.912 24.912 0 0 1-4.49-.905 3.75 3.75 0 0 1-7.48 0 24.51 24.51 0 0 1-3.178-.54l-1.18 1.18a.75.75 0 0 1-1.06-1.06L20.25 9Z" />
          <path d="M9.456 5.206A6.75 6.75 0 0 1 18.75 9v.75a8.217 8.217 0 0 1-.34 2.336.75.75 0 0 0 1.44.411c.148-.52.25-1.054.3-1.597V9a8.25 8.25 0 0 0-13.719-6.19l1.06 1.06a6.727 6.727 0 0 1 1.965-1.397V3a.75.75 0 0 0-1.5 0v.308a6.76 6.76 0 0 1 1.46.398Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export { NotificationBell };

import React from 'react';

// A newspaper icon that matches the theme of "The Hillside Echo".
const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2h0z"></path>
    <path d="M4 18h12"></path>
    <path d="M4 14h12"></path>
    <path d="M4 10h12"></path>
    <path d="M4 6h12"></path>
    <path d="M18 2v20"></path>
  </svg>
);


/**
 * A 404 Not Found component for your React application.
 * It's styled with Tailwind CSS to match the green, clean theme of the main site.
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen text-gray-800 font-sans">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-t-8 border-green-800">
        <header className="mb-6">
           <NewspaperIcon className="w-24 h-24 mx-auto text-green-700"/>
          <h1 className="text-8xl font-extrabold text-green-800 mt-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">Page Not Found</h2>
        </header>
        <main>
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          >
            Go to Homepage
          </a>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;


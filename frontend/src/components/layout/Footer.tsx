// src/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <span className="text-2xl mr-2">🐄</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Livestock Demo
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto text-sm">
            Technical Demonstration for Lead Full-Stack Developer Position
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Built with React 19, TypeScript, Tailwind CSS 4, and Leaflet
            </span>
            <span className="hidden sm:block">•</span>
            <a
              href="https://github.com/richiekaroki/livestock-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              View Source Code on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

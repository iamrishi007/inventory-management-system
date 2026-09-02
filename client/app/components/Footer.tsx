export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-4 bg-gray-50 dark:bg-white border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-900 dark:text-gray-900">
          © 2026 Inventory Management System. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Support</span>
        </div>
      </div>
    </footer>
  )
}

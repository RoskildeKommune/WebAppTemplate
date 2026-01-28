import { NavLink } from "react-router-dom"
import { Text } from "@tremor/react"

/**
 * Navigation links
 *
 * Tilføj nye menupunkter her når nye sider oprettes
 */
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Flows", href: "/flows", icon: "⚡" },
  // Tilføj flere her:
  // { name: "Robots", href: "/robots", icon: "🤖" },
  // { name: "Logs", href: "/logs", icon: "📋" },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Text className="text-xl font-bold text-white">RPA Dashboard</Text>
        <Text className="text-sm text-gray-400">ROS-Automation</Text>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Text className="text-xs text-gray-500">v0.1.0</Text>
      </div>
    </div>
  )
}

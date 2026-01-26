/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描所有组件和页面文件
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

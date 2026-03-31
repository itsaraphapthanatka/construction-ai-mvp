/** @type {import('next').NextConfig} */
const nextConfig = {
  // สำคัญมาก: ต้องมี basePath
  basePath: '/ai_dashboard',
  
  // เพิ่ม assetPrefix เพื่อให้ไฟล์ CSS/JS โหลดผ่าน path ที่ถูกต้อง
  assetPrefix: '/ai_dashboard',

  reactStrictMode: true,
  // ถ้ามีการใช้ image จากโดเมนภายนอก อย่าลืมตั้งค่า images: { domains: [...] }
}

module.exports = nextConfig
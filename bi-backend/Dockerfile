FROM node:20-alpine

# 2. CHẠY LỆNH NÀY: Cập nhật toàn bộ các package của Alpine Linux để vá lỗ hổng
RUN apk update && apk upgrade --no-cache
# Bật corepack để sử dụng pnpm mặc định có sẵn của Node.js
RUN npm install -g pnpm

WORKDIR /app

# Chỉ copy 2 file quản lý thư viện vào trước để tận dụng Docker cache
COPY package.json pnpm-lock.yaml ./

# Cài đặt dependencies (dùng --frozen-lockfile tương đương với npm ci, giúp cài chuẩn xác theo file lock)
RUN pnpm install --frozen-lockfile

# Copy toàn bộ source code vào
COPY . .

EXPOSE 5001

# Lệnh khởi chạy
CMD ["pnpm", "start"]
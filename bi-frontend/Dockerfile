FROM node:20-alpine

RUN apk update && apk upgrade --no-cache

# Bật corepack để sử dụng pnpm mặc định có sẵn của Node.js
RUN npm install -g pnpm

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. Đưa ARG vào ENV để Next.js có thể đọc được lúc chạy lệnh build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

WORKDIR /app

# Chỉ copy 2 file quản lý thư viện vào trước để tận dụng Docker cache
COPY package.json pnpm-lock.yaml ./

# Cài đặt dependencies (dùng --frozen-lockfile tương đương với npm ci, giúp cài chuẩn xác theo file lock)
RUN pnpm install --frozen-lockfile

RUN pnpm run build

# Copy toàn bộ source code vào
COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]
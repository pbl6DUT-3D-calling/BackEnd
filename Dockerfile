# 1. Chọn Base Image (Môi trường Node.js nhẹ nhất)
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file định nghĩa thư viện trước (để tận dụng cache)
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. Copy toàn bộ code nguồn vào
COPY . .

# 6. Mở cổng (Port)
EXPOSE 3000

# 7. Lệnh chạy server
CMD ["npm", "start"]
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Download PocketBase
# Check https://github.com/pocketbase/pocketbase/releases for the latest stable version
ARG PB_VERSION="0.21.1" # !!! IMPORTANT: Update this to the latest stable version if needed !!!
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip && \
    unzip -q pocketbase_${PB_VERSION}_linux_amd64.zip && \
    rm pocketbase_${PB_VERSION}_linux_amd64.zip

FROM alpine:3.18

# Install necessary dependencies (e.g., for image processing in PocketBase)
# ffmpeg is often required for video/audio processing via PocketBase
RUN apk add --no-cache ca-certificates ffmpeg

WORKDIR /pb

# Copy PocketBase executable
COPY --from=builder /build/pocketbase .

# Create pb_data directory and set permissions
# This is where PocketBase stores its database and files. This path must match the Render Persistent Disk mount path.
RUN mkdir -p /pb_data && chmod -R 777 /pb_data

# Expose default PocketBase port
EXPOSE 8090

# Start PocketBase
# --dir specifies the data directory
ENTRYPOINT ["/pb/pocketbase", "serve", "--http", "0.0.0.0:8090", "--dir", "/pb_data"]

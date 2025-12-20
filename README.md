# How to install

### Make docker image
```sh
git clone https://github.com/silentesc/DatBot-Frontend.git
```
```sh
cd DatBot-Frontend
```
```txt
Don't forget to change src/settings.json for backend config
```
```sh
docker build -t datbot-frontend .
```

### Docker Compose
```yaml
services:
  datbot-frontend:
    image: datbot-frontend
    container_name: datbot-frontend
    ports:
      - "8081:8081"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    restart: unless-stopped
```

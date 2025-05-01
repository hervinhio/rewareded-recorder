FROM ubuntu:latest

ENV PATH=$PATH:/usr/local/go/bin

# Tooling
RUN apt update -y
RUN apt install nodejs npm wget -y
RUN wget https://go.dev/dl/go1.24.2.linux-amd64.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.24.2.linux-amd64.tar.gz
RUN go version
RUN npm i -g yarn

# Assets
COPY . /build

# Build
RUN cd /build && yarn && yarn build
RUN cd /build/rewarded-server && go build -o server .
RUN mkdir /opt/app
RUN cp /build/rewarded-server/server /opt/app
RUN cp -r /build/dist /opt/app/frontend

# Finalizing
WORKDIR /opt/app
CMD ["/opt/app/server"]

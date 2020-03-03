FROM bitwalker/alpine-elixir:latest

RUN \
	mix local.hex --force && \
	mix local.rebar --force && \
	wget https://github.com/phoenixframework/archives/raw/master/phx_new.ez && \
	mix archive.install phx_new.ez 

RUN \
	apk update && apk upgrade && \
	apk add --no-cache --update postgresql-client inotify-tools && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.11/main/ nodejs=12.15.0-r1 && \
    apk add --no-cache --update npm
	
WORKDIR /app
EXPOSE 4000

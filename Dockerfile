FROM bitwalker/alpine-elixir:latest

RUN \
	mix local.hex --force && \
	mix local.rebar --force && \
	wget https://github.com/phoenixframework/archives/raw/master/phx_new.ez && \
	mix archive.install phx_new.ez 

RUN \
	apk update && apk upgrade && \
	apk add --no-cache --update postgresql-client && \
    apk add --no-cache --update nodejs && \
    apk add --no-cache --update npm && \
    apk add --no-cache --update inotify-tools
	
WORKDIR /app
EXPOSE 4000

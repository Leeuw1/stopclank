FROM postgres:alpine
RUN apk update
RUN apk add gcc clang19 llvm19 make curl-dev musl-dev
WORKDIR /
ADD https://github.com/pramsey/pgsql-http/archive/refs/tags/v1.7.0.tar.gz /pgsql-http.tar.gz
RUN tar -xzf /pgsql-http.tar.gz
RUN (cd /pgsql* && make && make install)
COPY init.sql /docker-entrypoint-initdb.d/init.sql

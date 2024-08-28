FROM postgres:latest

COPY init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=segam
ENV POSTGRES_PASSWORD=segam

EXPOSE 5432
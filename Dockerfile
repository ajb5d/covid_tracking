FROM rocker/geospatial:4.0.3

RUN install2.r janitor RcppRoll plumber

ENV PORT 8080
EXPOSE 8080

WORKDIR /app

COPY data data
COPY *.R  ./

ENTRYPOINT ["Rscript", "-e", "plumber::plumb('api.R')$run(host='0.0.0.0', port=as.numeric(Sys.getenv('PORT')))"]

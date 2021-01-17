FROM rocker/geospatial:4.0.3

RUN install2.r janitor RcppRoll

WORKDIR /app

COPY data data
COPY *.R  .

CMD ["/usr/local/bin/Rscript", "build_graph.R"] 

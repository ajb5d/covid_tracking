FROM rocker/geospatial:4.0.3

RUN install2.r janitor RcppRoll

WORKDIR /app

COPY . .

CMD ["/usr/local/bin/Rscript", "build_graph.R"] 

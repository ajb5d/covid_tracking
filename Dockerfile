FROM rocker/tidyverse:4.0.3

RUN /rocker_scripts/install_tidyverse.sh

RUN install2.r janitor RcppRoll

WORKDIR /app

COPY . .

CMD ["/usr/local/bin/Rscript", "build_graph.R"] 
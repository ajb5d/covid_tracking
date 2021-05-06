source("graphs.R")

if (dir.exists("/output")) {
  pdf("/output/output.pdf", width = 11, height = 8.5)
} else {
  pdf("output.pdf", width = 11, height = 8.5)
}

result <- build_graphs()
walk(result, print)

invisible(dev.off())

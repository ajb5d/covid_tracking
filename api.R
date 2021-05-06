source('graphs.R')
#* @get /
#* @serializer pdf list(width=11, height=8.5)
function() {
  result <- build_graphs()
  walk(result, print)
}

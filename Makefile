all:
	docker build . -t covid_graph
	docker run -v `pwd`:/output --rm covid_graph	


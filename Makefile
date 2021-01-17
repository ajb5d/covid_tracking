all:
	docker build . -t build_graph
	docker run -v `pwd`:/output build_graph	


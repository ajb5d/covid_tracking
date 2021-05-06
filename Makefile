image:
	docker build . -t covid_graph

clean:
	rm -f output.pdf

build:
	gcloud builds submit --tag gcr.io/gcd-test-163400/covid_graph

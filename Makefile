all: build

clean:
	rm -rf build/*
build:
	git archive master --format=zip > build/`git describe --tags`.zip

.PHONY: build

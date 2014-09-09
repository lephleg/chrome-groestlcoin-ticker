SHELL := /bin/bash

test:
	@NODE_TLS_REJECT_UNAUTHORIZED=0 ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--timeout 5000

.PHONY: test

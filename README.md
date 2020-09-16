# golang-test-annoations
A github action which annotates failed tests.

![GitHub Annotations](./static/example.png)

## How to use

Add to your workflow the following contents:

```yaml
name: workflow

on:
  push:
    branches: [ '**' ]
  pull_request:
    branches: [ '**' ]

jobs:
  full_ci:
    runs-on: ubuntu-18.04

    steps:
      - name : checkout
        uses: actions/checkout@v2

      - uses: actions/setup-go@v2
        with:
          go-version: '1.14'

      - name: run tests
        run: go test -json ./... > test.json

      - name: annotate tests
        if: always()
        uses: guyarb/golang-test-annoations@v0.1
        with:
          test-results: test.json
```

## Development of this action

1. Fork this repo.
2. Create a branch with your feature/bugfix.
3. Open a PR to me.

## Issues
Please open issues for any bug or suggestion you have.

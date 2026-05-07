.PHONY: dev build tidy hash

dev:
	go run .

build:
	go build -o api .

tidy:
	go mod tidy

# Gera hash bcrypt de uma senha: make hash PASS=minha-senha
hash:
	@go run -e ./tools/hash/main.go $(PASS)

package certprovider

import (
	"context"
	"log"
	"time"

	"github.com/hashicorp/vault-client-go"
)

type VaultCertProvider struct {
	client *vault.Client
}

func NewVaultCertProvider(ctx context.Context) *VaultCertProvider {
	client, err := vault.New(
		vault.WithAddress("https://vault.pycrs.cz"),
		vault.WithRequestTimeout(30*time.Second),
	)
	if err != nil {
		log.Fatal(err)
	}

	if err := client.SetToken("hvs.CAESIH9r5o9e3hZzCmTOrlkAFs-IkoUX6gHiA4snnr-rKERgGh4KHGh2cy5FaWIwTzBFTnZFWGFLblBvdEZjOWkwWlU"); err != nil {
		log.Fatal(err)
	}

	return &VaultCertProvider{
		client: client,
	}
}

package certprovider

type CertProvider interface {
	RenewCertificate() ([]byte, error)
}
